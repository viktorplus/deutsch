import type { AppState, Attempt, Word } from '../types';
import { scheduleReview } from '../lib/sm2';
export type StudyMode = 'cards'|'ru-de'|'de-ru'|'choice'|'articles'|'listening'|'sentence';
export interface WordTask { word:Word; prompt:string; expected:string; options:string[]; tokens:string[] }
export function shuffle<T>(items:readonly T[]):T[] {
 const copy=[...items];
 for(let index=copy.length-1;index>0;index--){const target=Math.floor(Math.random()*(index+1));[copy[index],copy[target]]=[copy[target],copy[index]];}
 return copy;
}
export function germanLabel(word:Word):string { return word.article ? `${word.article} ${word.german}` : word.german; }
export function buildWordTask(word:Word,mode:StudyMode,pool:Word[],reverse=false):WordTask {
 const german=germanLabel(word);
 const expected=mode==='de-ru'||mode==='choice'||(mode==='cards'&&!reverse)?word.russian:mode==='articles'?word.article??'':mode==='sentence'?word.example:german;
 const prompt=mode==='listening'?'Прослушайте и напишите по-немецки.':mode==='sentence'?word.exampleTranslation:mode==='articles'?word.german:mode==='ru-de'||(mode==='cards'&&reverse)?word.russian:german;
 const choices=mode==='choice'?shuffle([expected,...shuffle([...new Set(pool.filter(other=>other.russian!==expected).map(other=>other.russian))]).slice(0,3)]):mode==='articles'?['der','die','das']:[];
 return {word,prompt,expected,options:choices,tokens:mode==='sentence'?shuffle(word.example.trim().split(/\s+/)):[]};
}
// Called only inside the serialized store update: attempt and scheduling commit together.
export function recordLearningAttempt(draft:AppState,attempt:Attempt,remediation=false):void {
 if(draft.attempts.some(previous=>previous.id===attempt.id))return;
 draft.attempts.push(attempt);
 if(!attempt.correct)draft.mistakes.push({id:`mistake-${attempt.id}`,attemptId:attempt.id,itemId:attempt.itemId,kind:attempt.kind,topic:attempt.topic,userAnswer:attempt.userAnswer,expected:attempt.expected,explanation:attempt.explanation,at:attempt.at,resolved:false});
 if(remediation&&attempt.correct)for(const mistake of draft.mistakes)if(mistake.itemId===attempt.itemId&&mistake.kind===attempt.kind)mistake.resolved=true;
 if(attempt.kind==='word'&&draft.words.some(word=>word.id===attempt.itemId))draft.schedules[attempt.itemId]={itemId:attempt.itemId,...scheduleReview(draft.schedules[attempt.itemId],attempt.rating??(attempt.correct?'good':'again'),new Date(attempt.at))};
}
export function dueWords(state:AppState,now=new Date()):Word[] {
 return state.words.filter(word=>state.schedules[word.id]&&new Date(state.schedules[word.id].due).getTime()<=now.getTime()).sort((a,b)=>state.schedules[a.id].due.localeCompare(state.schedules[b.id].due));
}
