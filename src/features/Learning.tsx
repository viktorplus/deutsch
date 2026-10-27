import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { BookOpen, Check, ChevronRight, Headphones, RotateCcw, Volume2 } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { useAppStore } from '../store';
import { checkAnswer } from '../lib/checkAnswer';
import { grammarTopics } from '../data/grammar';
import { buildWordTask, dueWords, germanLabel, recordLearningAttempt, shuffle } from '../data/learning';
import type { StudyMode, WordTask } from '../data/learning';
import type { Attempt, GrammarExercise, Level, Rating } from '../types';

const row:CSSProperties={display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'};
const stack:CSSProperties={display:'grid',gap:20};
const grid:CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,250px),1fr))',gap:16};
const levels:Level[]=['A1','A2','B1','B2','C1','C2'];
const modes:{id:StudyMode;label:string;detail:string}[]=[
 {id:'cards',label:'Карточки',detail:'Вспомните ответ, переверните и оцените себя.'},
 {id:'ru-de',label:'Русский → немецкий',detail:'Напишите перевод с артиклем, если он есть.'},
 {id:'de-ru',label:'Немецкий → русский',detail:'Напишите русский перевод из набора.'},
 {id:'choice',label:'Выбор ответа',detail:'Выберите один из четырёх переводов.'},
 {id:'articles',label:'Артикли',detail:'Вспомните род существительного.'},
 {id:'listening',label:'Аудирование',detail:'Прослушайте и запишите слово с артиклем.'},
 {id:'sentence',label:'Собрать предложение',detail:'Поставьте немецкие слова в нужном порядке.'},
];
const ratings:{id:Rating;label:string;key:string}[]=[{id:'again',label:'Снова',key:'1'},{id:'hard',label:'Трудно',key:'2'},{id:'good',label:'Хорошо',key:'3'},{id:'easy',label:'Легко',key:'4'}];
function Heading({title,description}:{title:string;description:string}) {return <header className="page-header"><div><span className="eyebrow">DEUTSCHMASTER · ПРАКТИКА</span><h1>{title}</h1><p className="muted">{description}</p></div></header>;}
function EmptyContent({level}:{level:Level}) {return <Card><BookOpen size={26}/><h2 style={{marginTop:16}}>Материалы {level} не найдены</h2><p className="muted" style={{marginTop:8}}>Измените фильтры или добавьте карточки в свой словарь. Прогресс появится после сохранённых ответов.</p></Card>;}
function LevelSelect({value,onChange}:{value:Level;onChange:(level:Level)=>void}) {return <label>Уровень<select aria-label="Уровень" className="field" value={value} onChange={event=>onChange(event.target.value as Level)}>{levels.map(level=><option key={level}>{level}</option>)}</select></label>;}
function useLocalGermanVoice() {
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 useEffect(()=>{
  if(!('speechSynthesis' in window))return;
  const read=()=>setVoices(window.speechSynthesis.getVoices().filter(voice=>voice.localService&&/^de(?:-|_|$)/i.test(voice.lang)));
  read(); window.speechSynthesis.addEventListener('voiceschanged',read);
  return()=>{window.speechSynthesis.removeEventListener('voiceschanged',read);window.speechSynthesis.cancel();};
 },[]);
 return voices[0];
}
function VoiceHelp() {return <div className="feedback" role="status"><Headphones size={20}/><p>Локальный немецкий голос не найден. В Windows откройте «Параметры → Время и язык → Речь → Управление голосами», установите немецкий голос и перезапустите приложение. Аудирование станет доступно после появления локального голоса. Остальные режимы работают без него.</p></div>;}

interface Task {id:string;kind:'word'|'grammar';prompt:string;expected:string;explanation:string;topic:string;alternatives?:string[];wordTask?:WordTask}
function fromWord(task:WordTask):Task {return {id:task.word.id,kind:'word',prompt:task.prompt,expected:task.expected,explanation:task.word.article?`Артикль: ${task.word.article}; множественное число: ${task.word.plural||'не указано'}.`:'Сравните перевод и написание с образцом.',topic:task.word.topic,wordTask:task};}
function fromExercise(exercise:GrammarExercise,title:string):Task {return {id:exercise.id,kind:'grammar',prompt:exercise.prompt,expected:exercise.answer,explanation:exercise.explanation,topic:title,alternatives:exercise.alternatives};}

function Session({tasks,mode,title,onExit,remediation=false,voice}:{tasks:Task[];mode:string;title:string;onExit:()=>void;remediation?:boolean;voice?:SpeechSynthesisVoice}) {
 const [index,setIndex]=useState(0);const [results,setResults]=useState<boolean[]>([]);const {state}=useAppStore();
 const task=tasks[index];
 if(index>=tasks.length)return <Card><span className="badge">Сессия завершена</span><h2 style={{marginTop:18}}>Отличная работа — ответы сохранены</h2><p style={{margin:'14px 0 22px'}}>Проверено: {results.length}. Верных: {results.filter(Boolean).length}. Ошибок: {results.filter(result=>!result).length}.</p><Button onClick={onExit}><RotateCcw size={16}/>Новая сессия</Button></Card>;
 if(task.kind==='word'&&!state.words.some(word=>word.id===task.id))return <Card><p>Эта карточка была удалена из словаря и больше не участвует в тренировке.</p><Button onClick={()=>setIndex(index+1)}>Пропустить</Button><Button variant="secondary" onClick={onExit}>К настройкам сессии</Button></Card>;
 return <div style={stack}><div style={{...row,justifyContent:'space-between'}}><div><span className="badge">{title}</span><p className="muted" style={{marginTop:8}}>Задание {index+1} из {tasks.length}</p></div><Button variant="secondary" onClick={onExit}>Завершить сессию</Button></div><progress aria-label="Прогресс сессии" value={index} max={tasks.length} style={{width:'100%',accentColor:'var(--primary)',height:8}}/><ExerciseCard key={`${index}-${task.id}`} task={task} mode={mode} remediation={remediation} voice={voice} onContinue={correct=>{setResults(previous=>[...previous,correct]);setIndex(previous=>previous+1);}}/></div>;
}

function ExerciseCard({task,mode,onContinue,remediation,voice}:{task:Task;mode:string;onContinue:(correct:boolean)=>void;remediation:boolean;voice?:SpeechSynthesisVoice}) {
 const {state,update}=useAppStore();const [answer,setAnswer]=useState('');const [revealed,setRevealed]=useState(false);const [result,setResult]=useState<Attempt|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [picked,setPicked]=useState<number[]>([]);const [speechError,setSpeechError]=useState('');
 const busyRef=useRef(false);const attemptId=useRef(crypto.randomUUID());const input=useRef<HTMLInputElement>(null);const focusArea=useRef<HTMLDivElement>(null);
 const selfRated=mode==='cards'||mode==='review';const isListening=mode==='listening';
 useEffect(()=>{if(input.current)input.current.focus();else focusArea.current?.focus();return()=>{if('speechSynthesis'in window)window.speechSynthesis.cancel();};},[]);
 const typed=mode==='sentence'?picked.map(index=>task.wordTask!.tokens[index]).join(' '):answer;
 async function save(rating?:Rating){
  if(busyRef.current||result)return;
  if(!selfRated&&!typed.trim())return;
  busyRef.current=true;setBusy(true);setError('');
  const checked=selfRated?{correct:rating!=='again',explanation:rating==='again'?'Самооценка: ответ не вспомнился.':'Самооценка: ответ вспомнился.'}:checkAnswer(typed,task.expected,state.settings.strict,task.alternatives);
  const attempt:Attempt={id:attemptId.current,itemId:task.id,kind:task.kind,mode,topic:task.topic,userAnswer:selfRated?(rating==='again'?'Не помню (самооценка)':'Помню (самооценка)'):typed,expected:task.expected,correct:checked.correct,explanation:`${checked.explanation} ${task.explanation}`,at:new Date().toISOString(),...(rating?{rating}:{})};
  try{await update(draft=>recordLearningAttempt(draft,attempt,remediation));setResult(attempt);}catch(caught){setError(caught instanceof Error?caught.message:'Не удалось сохранить ответ. Повторите попытку.');}finally{busyRef.current=false;setBusy(false);}
 }
 function submit(event:FormEvent){event.preventDefault();if(result)onContinue(result.correct);else void save();}
 function insert(character:string){const field=input.current;if(!field)return;const start=field.selectionStart??answer.length;const end=field.selectionEnd??start;setAnswer(answer.slice(0,start)+character+answer.slice(end));requestAnimationFrame(()=>{field.focus();field.setSelectionRange(start+1,start+1);});}
 function speak(){if(!voice||!task.wordTask)return;setSpeechError('');window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(germanLabel(task.wordTask.word));speech.voice=voice;speech.lang=voice.lang;speech.rate=.85;speech.onerror=()=>setSpeechError('Не удалось воспроизвести голос. Проверьте установленный языковой пакет.');window.speechSynthesis.speak(speech);}
 return <Card><div ref={focusArea} tabIndex={-1} style={stack} onKeyDown={event=>{
  if(selfRated&&!result&&!busy){if(event.key==='Enter'&&!revealed){event.preventDefault();setRevealed(true);}else if(revealed&&['1','2','3','4'].includes(event.key)){event.preventDefault();void save(ratings[Number(event.key)-1].id);}}
  if(!selfRated&&!result&&['choice','articles','sentence'].includes(mode)&&event.key==='Enter'){event.preventDefault();void save();}
  if(result&&event.key==='Enter'&&!(event.target instanceof HTMLButtonElement)){event.preventDefault();onContinue(result.correct);}
 }}><span className="muted">{task.topic} · {state.settings.strict?'строгая проверка':'мягкая проверка'}</span><h2 style={{fontSize:28,lineHeight:1.5}}>{task.prompt}</h2>
  {isListening&&<><Button variant="secondary" onClick={speak} disabled={!voice||busy}><Volume2 size={18}/>Прослушать</Button>{!voice&&<VoiceHelp/>}{speechError&&<p className="error" role="alert">{speechError}</p>}</>}
  {selfRated?<>
   {!revealed?<><p className="muted">Вспомните перевод, затем откройте ответ.</p><Button onClick={()=>{setRevealed(true);focusArea.current?.focus();}}>Показать ответ <ChevronRight size={16}/></Button></>:<><div style={{padding:20,borderRadius:12,background:'var(--surface-soft)'}}><h2>{task.expected}</h2>{task.wordTask&&<><p style={{marginTop:12}} lang="de">{task.wordTask.word.example}</p><p className="muted">{task.wordTask.word.exampleTranslation}</p></>}</div>{!result&&<><p className="muted">Оцените, насколько легко вспомнился ответ. Клавиши 1–4.</p><div style={row}>{ratings.map(rating=><Button key={rating.id} disabled={busy} variant={rating.id==='again'?'secondary':'default'} onClick={()=>void save(rating.id)}>{rating.key} · {rating.label}</Button>)}</div></>}</>}
  </>:<form onSubmit={submit} style={stack}>
   {mode==='choice'||mode==='articles'?<div style={grid}>{task.wordTask!.options.map(option=><Button key={option} type="button" variant={answer===option?'default':'secondary'} disabled={busy||Boolean(result)} aria-pressed={answer===option} onClick={()=>setAnswer(option)}>{option}</Button>)}</div>:mode==='sentence'?<><div aria-label="Ваше предложение" style={{...row,minHeight:65,padding:12,border:'1px dashed var(--line)',borderRadius:12}}>{picked.length?picked.map((token,index)=><Button key={`${token}-${index}`} type="button" variant="secondary" disabled={busy||Boolean(result)} onClick={()=>setPicked(previous=>previous.filter((_,position)=>position!==index))}>{task.wordTask!.tokens[token]}</Button>):<span className="muted">Нажимайте на слова ниже</span>}</div><div style={row}>{task.wordTask!.tokens.map((token,index)=><Button type="button" variant="secondary" key={index} disabled={picked.includes(index)||busy||Boolean(result)} onClick={()=>setPicked(previous=>[...previous,index])}>{token}</Button>)}</div></>:<><label>Ваш ответ<Input ref={input} aria-label="Ваш ответ" autoComplete="off" spellCheck={false} value={answer} disabled={busy||Boolean(result)} onChange={event=>setAnswer(event.target.value)}/></label><div style={row} aria-label="Немецкая клавиатура">{['ä','ö','ü','ß','Ä','Ö','Ü'].map(character=><Button key={character} type="button" variant="secondary" disabled={busy||Boolean(result)} onMouseDown={event=>event.preventDefault()} onClick={()=>insert(character)}>{character}</Button>)}</div></>}
   {!result&&<Button type="submit" disabled={busy||!typed.trim()||(isListening&&!voice)}>{busy?'Сохраняем…':'Проверить'}</Button>}
  </form>}
  {error&&<p className="error" role="alert">{error} Ответ остаётся в поле. Повторите сохранение.</p>}
  {result&&<><div role="status" className={`feedback ${result.correct?'success':'error'}`}><strong>{result.correct?'Верно':'Нужно повторить'}</strong><p>Ваш ответ: {result.userAnswer}</p><p>Правильный ответ: <strong>{result.expected}</strong></p><p>{result.explanation}</p>{task.wordTask&&<p style={{marginTop:10}}><span lang="de">{task.wordTask.word.example}</span><br/>{task.wordTask.word.exampleTranslation}</p>}</div><Button autoFocus onClick={()=>onContinue(result.correct)}>Продолжить <ChevronRight size={16}/></Button></>}
 </div></Card>;
}

export function Study() {
 const {state}=useAppStore();const [level,setLevel]=useState<Level>(state.settings.level);const [set,setSet]=useState('');const [mode,setMode]=useState<StudyMode>('cards');const [size,setSize]=useState(state.settings.sessionSize);const [reverse,setReverse]=useState(false);const [session,setSession]=useState<Task[]|null>(null);const voice=useLocalGermanVoice();
 const pool=state.words.filter(word=>word.level===level&&(!set||word.set===set));const eligible=pool.filter(word=>mode==='articles'?Boolean(word.article):mode==='sentence'?Boolean(word.example.trim()):true);
 function start(){setSession(shuffle(eligible).slice(0,size).map(word=>fromWord(buildWordTask(word,mode,pool,reverse))));}
 return <><Heading title="Тренировка слов" description="Небольшая сессия каждый день — большой словарный запас со временем."/>{session?<Session tasks={session} mode={mode} title={modes.find(item=>item.id===mode)!.label} onExit={()=>setSession(null)} voice={voice}/>:<div style={stack}><Card><div style={{...row,alignItems:'end'}}><LevelSelect value={level} onChange={value=>{setLevel(value);setSet('');}}/><label>Набор<select className="field" aria-label="Набор" value={set} onChange={event=>setSet(event.target.value)}><option value="">Все наборы</option>{[...new Set(state.words.filter(word=>word.level===level).map(word=>word.set))].map(name=><option key={name}>{name}</option>)}</select></label><label>Размер сессии<Input aria-label="Размер сессии" type="number" min={1} max={100} value={size} onChange={event=>setSize(Math.max(1,Math.min(100,Number(event.target.value)||1)))}/></label></div></Card>{pool.length===0&&level!=='A1'&&level!=='A2'?<EmptyContent level={level}/>:<><div style={grid}>{modes.map(item=><button type="button" className="panel" style={{textAlign:'left',outline:mode===item.id?'2px solid var(--primary)':undefined}} key={item.id} onClick={()=>setMode(item.id)} aria-pressed={mode===item.id}><div style={{...row,justifyContent:'space-between'}}><h3>{item.label}</h3>{mode===item.id&&<Check size={18} color="var(--primary)"/>}</div><p className="muted" style={{fontSize:13,marginTop:10}}>{item.detail}</p></button>)}</div><Card><div style={{...row,justifyContent:'space-between'}}><div><h3>Готовы начать?</h3><p className="muted">Доступно карточек: {eligible.length}. В сессии: {Math.min(size,eligible.length)}.</p>{mode==='cards'&&<label style={{...row,marginTop:10}}><input type="checkbox" checked={reverse} onChange={event=>setReverse(event.target.checked)}/>Показывать сначала русский перевод</label>}{mode==='choice'&&new Set(pool.map(word=>word.russian)).size<4&&<p className="muted">Для четырёх вариантов нужны минимум четыре разных перевода в выбранном наборе.</p>}</div><Button onClick={start} disabled={!eligible.length||(mode==='listening'&&!voice)||(mode==='choice'&&new Set(pool.map(word=>word.russian)).size<4)}>Начать тренировку <ChevronRight size={17}/></Button></div>{mode==='listening'&&!voice&&<VoiceHelp/>}{!eligible.length&&<p className="empty">В этом наборе нет подходящих карточек. Выберите другой набор или добавьте слова в словарь.</p>}</Card></>}</div>}</>;
}

export function Grammar() {
 const {state}=useAppStore();const [level,setLevel]=useState<Level>(state.settings.level);const [selected,setSelected]=useState<string|null>(null);const [session,setSession]=useState<{tasks:Task[];final:boolean}|null>(null);
 const topic=grammarTopics.find(item=>item.id===selected);const topics=grammarTopics.filter(item=>item.level===level);
 const weak=new Set(state.mistakes.filter(mistake=>mistake.kind==='grammar'&&!mistake.resolved).map(mistake=>mistake.topic));
 function start(final:boolean){if(!topic)return;setSession({tasks:(final?topic.finalTest:topic.exercises).map(exercise=>fromExercise(exercise,topic.title)),final});}
 return <><Heading title="Грамматика" description="Разберите правило, потренируйтесь и проверьте себя в итоговом тесте."/>{session?<Session tasks={session.tasks} mode={session.final?'grammar-final':'grammar'} title={session.final?'Итоговый тест':'Практика грамматики'} remediation onExit={()=>setSession(null)}/>:<div style={stack}><div style={row}><LevelSelect value={level} onChange={value=>{setLevel(value);setSelected(null);}}/>{topic&&<Button variant="secondary" onClick={()=>setSelected(null)}>Все темы</Button>}</div>{!topics.length?<EmptyContent level={level}/>:topic?<><Card><span className="badge">{topic.level}</span><h2 style={{margin:'16px 0'}}>{topic.title}</h2><p>{topic.explanation}</p><div style={{overflowX:'auto',marginTop:20}}><table><thead><tr>{topic.table[0].map((cell,index)=><th scope="col" key={index}>{cell}</th>)}</tr></thead><tbody>{topic.table.slice(1).map((cells,index)=><tr key={index}>{cells.map((cell,column)=><td key={column}>{cell}</td>)}</tr>)}</tbody></table></div><h3 style={{marginTop:24}}>Примеры</h3>{topic.examples.map(example=><div key={example.german} style={{paddingTop:14}}><p lang="de">{example.german}</p><p className="muted">{example.russian}</p></div>)}<div style={{...row,marginTop:24}}><Button onClick={()=>start(false)}>Практика · {topic.exercises.length} задания</Button><Button variant="secondary" onClick={()=>start(true)}>Итоговый тест · {topic.finalTest.length} задание</Button></div></Card></>:<div style={grid}>{topics.map(item=>{const ids=new Set([...item.exercises,...item.finalTest].map(exercise=>exercise.id));const attempted=new Set(state.attempts.filter(attempt=>attempt.kind==='grammar'&&ids.has(attempt.itemId)).map(attempt=>attempt.itemId));return <button key={item.id} className="panel" style={{textAlign:'left'}} onClick={()=>setSelected(item.id)}><span className="badge">{item.level}</span><h3 style={{margin:'16px 0 8px'}}>{item.title}</h3><p className="muted" style={{fontSize:13}}>{weak.has(item.title)?'Есть ошибки — стоит повторить':'Правило, примеры, упражнения и тест'}</p><p className="muted" style={{fontSize:12,marginTop:14}}>Попробовано заданий: {attempted.size} из {ids.size}</p><span style={{...row,marginTop:16,color:'var(--primary)',fontSize:13}}>Открыть тему <ChevronRight size={16}/></span></button>;})}</div>}</div>}</>;
}

export function Review() {
 const {state}=useAppStore();const [session,setSession]=useState<Task[]|null>(null);const due=dueWords(state);
 const scheduled=state.words.filter(word=>state.schedules[word.id]);const next=scheduled.map(word=>state.schedules[word.id].due).sort()[0];
 return <><Heading title="Повторение" description="Интервальные повторения SM-2: вспомните перевод и оцените, насколько легко он дался."/>{session?<Session tasks={session} mode="review" title="Повторение по расписанию" onExit={()=>setSession(null)}/>:<Card><h2>{due.length?'Пора освежить слова':'На сегодня всё спокойно'}</h2><p className="muted" style={{margin:'14px 0 22px'}}>Сейчас к повторению: {due.length}. Новые слова попадут сюда после первой тренировки.{!due.length&&next?` Ближайшее повторение: ${new Date(next).toLocaleString('ru-RU')}.`:''}</p><Button disabled={!due.length} onClick={()=>setSession(due.slice(0,state.settings.sessionSize).map(word=>fromWord(buildWordTask(word,'cards',state.words))))}>Повторить слова <RotateCcw size={16}/></Button><p className="muted" style={{marginTop:18,fontSize:13}}>«Снова» возвращает карточку через день. «Трудно», «Хорошо», «Легко» увеличивают интервалы по алгоритму. Каждая оценка сохраняет ровно одну запись.</p></Card>}</>;
}

export function Mistakes() {
 const {state}=useAppStore();const [session,setSession]=useState<Task[]|null>(null);
 const unresolved=state.mistakes.filter(mistake=>!mistake.resolved);const exercises=grammarTopics.flatMap(topic=>[...topic.exercises,...topic.finalTest].map(exercise=>({exercise,topic})));
 const tasks:Task[]=[];const seen=new Set<string>();
 for(const mistake of unresolved){const key=`${mistake.kind}-${mistake.itemId}`;if(seen.has(key))continue;seen.add(key);if(mistake.kind==='word'){const word=state.words.find(item=>item.id===mistake.itemId);if(word)tasks.push(fromWord(buildWordTask(word,'ru-de',state.words)));}else{const found=exercises.find(item=>item.exercise.id===mistake.itemId);if(found)tasks.push(fromExercise(found.exercise,found.topic.title));}}
 return <><Heading title="Работа над ошибками" description="Ошибки — часть обучения. Верный ответ в повторной тренировке отметит их исправленными."/>{session?<Session tasks={session} mode="mistakes" title="Повторение ошибок" remediation onExit={()=>setSession(null)}/>:<div style={stack}><Card><div style={{...row,justifyContent:'space-between'}}><div><h2>Неразобранных ошибок: {unresolved.length}</h2><p className="muted">Доступно уникальных заданий: {tasks.length}. Исправлено: {state.mistakes.filter(mistake=>mistake.resolved).length}.</p></div><Button disabled={!tasks.length} onClick={()=>setSession(shuffle(tasks).slice(0,state.settings.sessionSize))}>Разобрать ошибки <ChevronRight size={16}/></Button></div>{!unresolved.length&&<p className="empty">Пока ошибок нет. Результаты тренировок появятся здесь автоматически.</p>}</Card>{unresolved.slice().reverse().map(mistake=><Card key={mistake.id}><div style={{...row,justifyContent:'space-between'}}><h3>{mistake.topic}</h3><span className="badge">{mistake.kind==='word'?'Слово':'Грамматика'}</span></div><p style={{marginTop:12}}>Ваш ответ: {mistake.userAnswer}</p><p>Ожидалось: <strong>{mistake.expected}</strong></p><p className="muted">{mistake.explanation}</p><p className="muted" style={{fontSize:12,marginTop:12}}>{new Date(mistake.at).toLocaleString('ru-RU')}</p>{mistake.kind==='word'&&!state.words.some(word=>word.id===mistake.itemId)&&<p className="muted">Карточка удалена из словаря. История сохранена; тренировка недоступна.</p>}</Card>)}</div>}</>;
}

