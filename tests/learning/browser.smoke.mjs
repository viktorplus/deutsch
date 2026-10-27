import { chromium, expect } from '@playwright/test';
import { starterWords } from '../../src/data/words.ts';

// Run against the Vite preview: node tests/learning/browser.smoke.mjs
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const seed={version:1,words:starterWords.slice(0,4),attempts:[],mistakes:[],schedules:{},settings:{theme:'light',strict:true,sessionSize:1,dailyGoal:15,level:'A1'}};
await page.addInitScript(({seed})=>{
 if(!localStorage.getItem('deutschmaster.state.v1'))localStorage.setItem('deutschmaster.state.v1',JSON.stringify(seed));
 Math.random=()=>.999;
 const voice={lang:'de-DE',localService:true,name:'Test local German',voiceURI:'test-de',default:true};
 Object.defineProperty(window.speechSynthesis,'getVoices',{value:()=>[voice]});
 Object.defineProperty(window.speechSynthesis,'speak',{value:speech=>{window.__spoken=speech.text;}});
 Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {constructor(text){this.text=text;}}});
},{seed});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('deutschmaster.state.v1')));
const words=async()=>{await page.getByRole('button',{name:'Изучение слов',exact:true}).click();};
const mode=async name=>{
 await words();
 const exit=page.getByRole('button',{name:'Завершить сессию'});const restart=page.getByRole('button',{name:'Новая сессия'});
 if(await exit.count())await exit.click();else if(await restart.count())await restart.click();
 await page.getByRole('button',{name:new RegExp(`^${name}`)}).click();await page.getByRole('button',{name:'Начать тренировку'}).click();
};
try{
 await page.goto('http://127.0.0.1:5173');
 await mode('Русский → немецкий');await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('das Haus');
 await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).press('Enter');await expect(page.getByRole('status')).toContainText('Верно');
 await expect.poll(async()=>(await saved()).attempts.length).toBe(1);
 await page.getByRole('button',{name:'Продолжить'}).click();await expect(page.getByText('Сессия завершена',{exact:true})).toBeVisible();
 await mode('Немецкий → русский');await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('дом');await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 await mode('Выбор ответа');const options=await page.locator('form button[aria-pressed]').allTextContents();expect(options).toHaveLength(4);
 await page.getByRole('button',{name:'дом',exact:true}).click();expect(await page.locator('form button[aria-pressed]').allTextContents()).toEqual(options);
 await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 await mode('Артикли');await page.getByRole('button',{name:'das',exact:true}).click();await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 await mode('Собрать предложение');for(const token of ['Das','Haus','ist','klein.'])await page.locator('form').getByRole('button',{name:token,exact:true}).last().click();
 await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 await mode('Аудирование');await expect(page.locator('main')).not.toContainText('das Haus');await page.getByRole('button',{name:'Прослушать',exact:true}).click();expect(await page.evaluate(()=>window.__spoken)).toBe('das Haus');
 await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('das Haus');await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 await mode('Карточки');await page.getByRole('button',{name:'Показать ответ'}).click();await page.keyboard.press('1');await expect(page.getByRole('status')).toContainText('Нужно повторить');
 await page.getByRole('button',{name:'Мои ошибки',exact:true}).click();await page.getByRole('button',{name:'Разобрать ошибки'}).click();await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('das Haus');await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');expect((await saved()).mistakes.every(m=>m.resolved)).toBe(true);
 await page.getByRole('button',{name:'Грамматика',exact:true}).click();await page.getByRole('button',{name:/Артикли: der/}).click();await page.getByRole('button',{name:/Практика ·/}).click();await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('der');await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 await page.getByRole('button',{name:'Завершить сессию'}).click();await page.getByRole('button',{name:/Итоговый тест ·/}).click();await expect(page.getByRole('heading',{name:'Переведите с определённым артиклем: книга'})).toBeVisible();
 await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('das Buch');await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');
 expect((await saved()).attempts).toHaveLength(10);expect(errors).toEqual([]);
 await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('deutschmaster.state.v1'));data.schedules.house=undefined;data.schedules['starter-n-1'].due='2026-01-01T00:00:00Z';localStorage.setItem('deutschmaster.state.v1',JSON.stringify(data));});
 await page.reload();await page.getByRole('button',{name:/^Повторение/}).click();await page.getByRole('button',{name:'Повторить слова'}).click();await page.getByRole('button',{name:'Показать ответ'}).click();await page.keyboard.press('3');await expect(page.getByRole('status')).toContainText('Верно');
 expect((await saved()).attempts).toHaveLength(11);expect((await saved()).attempts.at(-1).rating).toBe('good');
 await mode('Русский → немецкий');await page.getByRole('textbox',{name:'Ваш ответ',exact:true}).fill('das Haus');
 await page.evaluate(()=>{window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new Error('Learning smoke disk full');};});
 await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.locator('main').getByRole('alert').last()).toContainText('Learning smoke disk full');await expect(page.getByRole('textbox',{name:'Ваш ответ',exact:true})).toHaveValue('das Haus');expect((await saved()).attempts).toHaveLength(11);
 await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem;});await page.getByRole('button',{name:'Проверить',exact:true}).click();await expect(page.getByRole('status')).toContainText('Верно');expect((await saved()).attempts).toHaveLength(12);
 await page.reload();expect((await saved()).attempts).toHaveLength(12);expect(errors).toEqual([]);
 console.log('PASS: seven modes, stable choices, no listening leak, persistence and retry, due review, remediation, grammar and independent final.');
}finally{await browser.close();}

