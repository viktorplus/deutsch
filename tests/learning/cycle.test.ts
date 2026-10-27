import { expect, it } from 'vitest';
import { buildWordTask, dueWords, recordLearningAttempt } from '../../src/data/learning';
import type { AppState, Attempt, Word } from '../../src/types';
const word:Word={id:'house',german:'Haus',article:'das',plural:'Häuser',russian:'дом',example:'Das Haus ist klein.',exampleTranslation:'Дом маленький.',level:'A1',topic:'Дом',set:'Test'};
const state=():AppState=>({version:1,words:[word],attempts:[],mistakes:[],schedules:{},settings:{theme:'light',strict:true,sessionSize:10,dailyGoal:15,level:'A1'}});
const attempt=(patch:Partial<Attempt>={}):Attempt=>({id:'a',itemId:'house',kind:'word',mode:'review',topic:'Дом',userAnswer:'не знаю',expected:'дом',correct:false,explanation:'Сравните перевод.',at:'2026-10-19T10:00:00Z',rating:'again',...patch});
it('records once, creates a due schedule and retains incorrect answer evidence',()=>{
 const data=state();recordLearningAttempt(data,attempt());recordLearningAttempt(data,attempt());
 expect(data.attempts).toHaveLength(1);expect(data.mistakes).toHaveLength(1);
 expect(data.mistakes[0].userAnswer).toBe('не знаю');expect(data.schedules.house.due).toBe('2026-10-20T10:00:00.000Z');
});
it('resolves matching grammar mistakes only after successful remediation and keeps history',()=>{
 const data=state();recordLearningAttempt(data,attempt({id:'g',kind:'grammar',itemId:'dative-1',topic:'Dativ',rating:undefined}));
 recordLearningAttempt(data,attempt({id:'w'}));
 recordLearningAttempt(data,attempt({id:'fix',kind:'grammar',itemId:'dative-1',correct:true,rating:undefined}),true);
 expect(data.attempts).toHaveLength(3);expect(data.mistakes.find(m=>m.itemId==='dative-1')?.resolved).toBe(true);
 expect(data.mistakes.find(m=>m.itemId==='house')?.resolved).toBe(false);
});
it('excludes future schedules and deleted personal cards from the due queue',()=>{
 const data=state(); data.schedules.house={itemId:'house',interval:1,ease:2.5,repetitions:1,due:'2026-10-20T10:00:00Z'};
 expect(dueWords(data,new Date('2026-10-19T10:00:00Z'))).toHaveLength(0);
 expect(dueWords(data,new Date('2026-10-21T10:00:00Z'))).toHaveLength(1);
 data.words=[]; expect(dueWords(data,new Date('2026-10-21T10:00:00Z'))).toHaveLength(0);
});
it('requires noun articles in German and preserves duplicate assembly tokens',()=>{
 expect(buildWordTask(word,'ru-de',[word]).expected).toBe('das Haus');
 expect(buildWordTask({...word,example:'Das ist das Haus.'},'sentence',[word]).tokens.sort()).toEqual(['Das','Haus.','das','ist']);
});
