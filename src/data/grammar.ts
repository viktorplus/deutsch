import type { GrammarTopic, GrammarExercise, Level } from '../types';
import { extendLegacy } from './grammar/builders';
import { basicSupplements } from './grammar/basic-supplements';
import { b1Topics } from './grammar/b1';
import { b2Topics } from './grammar/b2';
import { c1Topics } from './grammar/c1';
import { c2Topics } from './grammar/c2';

const legacyTopics: GrammarTopic[] = [
 makeTopic('articles','A1','Артикли: der, die, das','Существительные учим с артиклем. В Nominativ определённые артикли: der (мужской), die (женский), das (средний); во множественном числе — die. Неопределённые: ein, eine, ein. Род часто нельзя вывести из перевода.',
  [['Род','Определённый','Неопределённый'],['Мужской','der Tisch','ein Tisch'],['Женский','die Tür','eine Tür'],['Средний','das Bett','ein Bett'],['Множественное','die Betten','—']],
  [{german:'Das ist eine Lampe.',russian:'Это лампа.'},{german:'Die Lampe ist neu.',russian:'Лампа новая.'}],
  [['Вставьте определённый артикль: ___ Tisch','der','Tisch — мужского рода; в Nominativ нужен der.'],['Вставьте определённый артикль: ___ Tür','die','Tür — женского рода; нужен die.'],['Вставьте неопределённый артикль: ___ Bett','ein','Bett — среднего рода; в Nominativ нужен ein.'],['Переведите с определённым артиклем: книга','das Buch','Buch — среднего рода; артикль das.']]),
 makeTopic('pronouns','A1','Личные местоимения','Местоимение заменяет имя человека или предмета и определяет форму глагола. sie означает «она» или «они»; вежливое Sie пишется с большой буквы. Для предмета местоимение выбирают по немецкому роду.',
  [['Лицо','Единственное','Множественное'],['1','ich — я','wir — мы'],['2','du — ты','ihr — вы (несколько близких)'],['3','er / sie / es','sie — они'],['Вежливо','Sie — Вы','Sie — Вы']],
  [{german:'Das Bett ist neu. Es ist bequem.',russian:'Кровать новая. Она удобная.'}],
  [['Замените Anna: ___ lernt Deutsch.','Sie','Anna — женщина; местоимение sie в начале предложения пишем Sie.'],['Замените Paul: ___ wohnt hier.','Er','Paul — мужчина; используем er, в начале предложения — Er.'],['Замените Paul und ich: ___ lernen.','Wir','Говорящий и ещё один человек — wir.'],['Замените du und Anna: ___ kommt morgen.','Ihr','Два собеседника при обращении на ты — ihr.']]),
 makeTopic('present','A1','Настоящее время: Präsens','У правильного глагола обычно убираем -en и добавляем окончание лица. На примере lernen: lern- + окончание. Неправильные глаголы и основы на -t/-d требуют отдельных правил.',
  [['Лицо','lernen'],['ich','lerne'],['du','lernst'],['er/sie/es','lernt'],['wir','lernen'],['ihr','lernt'],['sie/Sie','lernen']],
  [{german:'Wir lernen jeden Tag.',russian:'Мы учимся каждый день.'}],
  [['Вставьте lernen: ich ___','lerne','У ich окончание -e: lerne.'],['Вставьте machen: du ___','machst','У du окончание -st: machst.'],['Вставьте wohnen: er ___','wohnt','У er окончание -t: wohnt.'],['Вставьте spielen: ihr ___','spielt','У ihr окончание -t: spielt.']]),
 makeTopic('sein-haben','A1','Глаголы sein и haben','Sein («быть») и haben («иметь») имеют особые формы. В немецком настоящем времени связка sein обычно нужна: Ich bin müde. Haben также используют в конструкции «у меня есть».',
  [['Лицо','sein','haben'],['ich','bin','habe'],['du','bist','hast'],['er/sie/es','ist','hat'],['wir','sind','haben'],['ihr','seid','habt'],['sie/Sie','sind','haben']],
  [{german:'Ich bin hier und habe Zeit.',russian:'Я здесь, и у меня есть время.'}],
  [['Вставьте sein: Ich ___ müde.','bin','С ich используем bin.'],['Вставьте haben: Du ___ Zeit.','hast','С du используем hast.'],['Вставьте sein: Wir ___ hier.','sind','С wir используем sind.'],['Вставьте haben: Ihr ___ ein Buch.','habt','С ihr используем habt.']]),
 makeTopic('accusative','A1','Винительный падеж: Akkusativ','Прямое дополнение многих глаголов (sehen, kaufen, haben) стоит в Akkusativ. В определённых артиклях меняется только мужской род: der → den; в неопределённых ein → einen.',
  [['Род','Nominativ','Akkusativ'],['Мужской','der / ein','den / einen'],['Женский','die / eine','die / eine'],['Средний','das / ein','das / ein'],['Множественное','die','die']],
  [{german:'Ich sehe einen Vogel.',russian:'Я вижу птицу.'}],
  [['Определённый артикль: Ich sehe ___ Mann.','den','Mann — мужской род, прямое дополнение: den.'],['Неопределённый артикль: Ich kaufe ___ Tisch.','einen','Tisch — мужской род; в Akkusativ нужен einen.'],['Определённый артикль: Ich lese ___ Buch.','das','Buch — средний род; das не меняется.'],['Переведите: Я вижу собаку. (с определённым артиклем)','Ich sehe den Hund.','Hund — мужской род; прямое дополнение требует den Hund.']]),
 makeTopic('word-order','A1','Порядок слов','В обычном повествовательном главном предложении спрягаемый глагол стоит на второй позиции: перед ним один член предложения, а не обязательно одно слово. В вопросе без вопросительного слова глагол стоит первым.',
  [['Тип','Образец'],['Утверждение','Ich lerne heute.'],['Обстоятельство в начале','Heute lerne ich.'],['Вопрос да/нет','Lernst du heute?'],['Вопрос со словом','Wann lernst du?']],
  [{german:'Am Montag arbeite ich.',russian:'В понедельник я работаю.'}],
  [['Соберите: heute / Ich / lerne','Ich lerne heute.','Глагол lerne стоит после подлежащего Ich.'],['Соберите, начав с Heute: ich / lerne / Heute','Heute lerne ich.','После Heute идёт глагол, затем подлежащее.'],['Составьте вопрос да/нет: du / heute / Lernst','Lernst du heute?','В вопросе без вопросительного слова глагол стоит первым.'],['Соберите, начав с Morgen: wir / arbeiten / Morgen','Morgen arbeiten wir.','Morgen занимает первую позицию, arbeiten — вторую.']]),
 makeTopic('negation','A1','Отрицание: nicht и kein','Kein отрицает существительное с неопределённым или нулевым артиклем и склоняется как ein. Nicht отрицает признак, действие или определённую часть предложения. Его место зависит от того, что именно отрицается.',
  [['Что отрицаем','Пример'],['ein Buch','kein Buch'],['eine Tasche','keine Tasche'],['Прилагательное','nicht teuer'],['Действие целиком (простой случай)','Ich arbeite nicht.']],
  [{german:'Das ist kein Hotel. Es ist nicht teuer.',russian:'Это не отель. Это недорого.'}],
  [['Вставьте отрицание: Das ist ___ Buch.','kein','Перед существительным среднего рода без определённого артикля нужен kein.'],['Вставьте отрицание: Die Tasche ist ___ teuer.','nicht','Отрицаем прилагательное teuer: nicht.'],['Вставьте отрицание: Ich habe ___ Zeit.','keine','Zeit — женского рода, здесь Akkusativ: keine.'],['Отрицайте целое предложение: Ich arbeite.','Ich arbeite nicht.','В этом простом предложении отрицание действия nicht стоит в конце.']]),
 makeTopic('dative','A2','Дательный падеж: Dativ','Dativ нужен, например, после helfen, danken и предлогов mit, nach, bei, seit, von, zu, aus. Не определяйте падеж только по русскому переводу. Во множественном числе артикль den, к существительному обычно добавляют -n, если нет -n/-s.',
  [['Род','Определённый','Неопределённый'],['Мужской','dem Mann','einem Mann'],['Женский','der Frau','einer Frau'],['Средний','dem Kind','einem Kind'],['Множественное','den Kindern','—']],
  [{german:'Ich fahre mit dem Bus.',russian:'Я еду на автобусе.'}],
  [['Определённый артикль: Ich helfe ___ Mann.','dem','Helfen требует Dativ; мужской артикль dem.'],['Определённый артикль: Ich danke ___ Frau.','der','Danken требует Dativ; женский артикль der.'],['Определённый артикль: mit ___ Kindern','den','Mit требует Dativ; во множественном числе den Kindern.'],['Переведите: Я помогаю ребёнку. (с определённым артиклем)','Ich helfe dem Kind.','Helfen требует Dativ; средний род — dem Kind.']]),
 makeTopic('perfect','A2','Прошедшее время: Perfekt','Perfekt образуют из формы haben или sein и Partizip II. В главном предложении вспомогательный глагол на второй позиции, причастие в конце. Для многих глаголов перемещения и изменения состояния используют sein; выбор проверяют по словарю.',
  [['Инфинитив','Perfekt с ich'],['lernen','habe gelernt'],['kaufen','habe gekauft'],['gehen','bin gegangen'],['kommen','bin gekommen'],['machen','habe gemacht']],
  [{german:'Wir haben gestern gekocht.',russian:'Вчера мы готовили.'}],
  [['Вставьте вспомогательный глагол: Ich ___ gelernt.','habe','Lernen образует Perfekt с haben; ich habe.'],['Вставьте вспомогательный глагол: Er ___ nach Hause gegangen.','ist','Gehen в значении перемещения образует Perfekt с sein; er ist.'],['Partizip II от kaufen','gekauft','Правильное kaufen: ge- + kauf + -t.'],['Переведите: Мы сделали это. (das)','Wir haben das gemacht.','Wir haben + Partizip II gemacht; причастие в конце.']]),
 makeTopic('modals','A2','Модальные глаголы','Können выражает возможность или умение, müssen — необходимость, dürfen — разрешение, wollen — желание, sollen — поручение или рекомендацию. Спрягаемый модальный глагол стоит на второй позиции, основной инфинитив — в конце.',
  [['Лицо','können','müssen','dürfen'],['ich','kann','muss','darf'],['du','kannst','musst','darfst'],['er/sie/es','kann','muss','darf'],['wir','können','müssen','dürfen'],['ihr','könnt','müsst','dürft']],
  [{german:'Ich kann heute kommen.',russian:'Я могу прийти сегодня.'}],
  [['Вставьте können: Ich ___ schwimmen.','kann','В единственном числе ich kann, без окончания -e.'],['Вставьте müssen: Du ___ lernen.','musst','Форма du от müssen — musst.'],['Соберите: Wir / heute / müssen / arbeiten','Wir müssen heute arbeiten.','Müssen спрягается и стоит вторым, arbeiten в конце.'],['Вставьте dürfen: Ihr ___ hier bleiben.','dürft','Форма ihr от dürfen — dürft.']]),
 makeTopic('reflexive','A2','Возвратные глаголы','У возвратного глагола есть местоимение, относящееся к подлежащему. Его нельзя пропускать. Здесь тренируем формы Akkusativ на sich freuen. В других конструкциях встречается Dativ: Ich wasche mir die Hände.',
  [['Подлежащее','Местоимение (Akkusativ)'],['ich','mich'],['du','dich'],['er/sie/es','sich'],['wir','uns'],['ihr','euch'],['sie/Sie','sich']],
  [{german:'Wir freuen uns auf das Fest.',russian:'Мы с радостью ждём праздника.'}],
  [['Вставьте местоимение: Ich freue ___ auf morgen.','mich','При ich местоимение Akkusativ — mich.'],['Вставьте местоимение: Du freust ___ auf die Reise.','dich','При du местоимение Akkusativ — dich.'],['Вставьте местоимение: Wir freuen ___ auf das Fest.','uns','При wir местоимение — uns.'],['Переведите: Она радуется.','Sie freut sich.','При sie (она) возвратное местоимение sich обязательно.']]),
 makeTopic('separable','A2','Отделяемые приставки','У отделяемых глаголов приставка в простом главном предложении уходит в конец: anrufen → ich rufe an. В инфинитиве слово пишется слитно. При модальном глаголе инфинитив с приставкой остаётся в конце целиком.',
  [['Инфинитив','Главное предложение'],['aufstehen','Ich stehe auf.'],['anrufen','Ich rufe an.'],['einkaufen','Ich kaufe ein.'],['С модальным','Ich muss einkaufen.']],
  [{german:'Wir kaufen am Samstag ein.',russian:'Мы делаем покупки в субботу.'}],
  [['Вставьте приставку: Ich stehe früh ___. (aufstehen)','auf','В главном предложении приставка auf отделяется.'],['Вставьте приставку: Er ruft mich ___. (anrufen)','an','У anrufen отделяемая приставка an.'],['Вставьте приставку: Wir kaufen heute ___. (einkaufen)','ein','У einkaufen отделяемая приставка ein.'],['Переведите: Я звоню тебе. (anrufen)','Ich rufe dich an.','Спрягаем rufen, приставка an в конце; dich — дополнение.']]),
 makeTopic('prepositions','A2','Предлоги места: wo? wohin?','Wechselpräpositionen an, auf, hinter, in, neben, über, unter, vor, zwischen требуют Dativ при описании места (wo?) и Akkusativ при указании цели (wohin?). Само наличие движения не определяет падеж: движение может происходить внутри места.',
  [['Вопрос','Падеж','Пример'],['Где? wo?','Dativ','in dem Zimmer = im Zimmer'],['Куда? wohin?','Akkusativ','in das Zimmer = ins Zimmer'],['На столе','Dativ','auf dem Tisch'],['На стол (положить)','Akkusativ','auf den Tisch']],
  [{german:'Das Buch liegt auf dem Tisch.',russian:'Книга лежит на столе.'},{german:'Ich lege das Buch auf den Tisch.',russian:'Я кладу книгу на стол.'}],
  [['Определённый артикль: Das Buch liegt auf ___ Tisch.','dem','Где лежит? Место, Dativ: auf dem Tisch.'],['Определённый артикль: Ich lege das Buch auf ___ Tisch.','den','Куда кладу? Цель, Akkusativ: auf den Tisch.'],['Определённый артикль: Wir sind in ___ Schule.','der','Где? Dativ; Schule женского рода — in der Schule.'],['Вставьте слитную форму in + артикль: Ich gehe ___ Zimmer.','ins','Куда? in das Zimmer сокращается до ins Zimmer.']]),
 makeTopic('comparative','A2','Сравнительная степень','Обычно Komparativ образуют с -er: klein → kleiner. Некоторые прилагательные меняют гласную (alt → älter), некоторые имеют особую форму (gut → besser). При сравнении неравного используем als; при равенстве — so … wie.',
  [['Исходная форма','Komparativ'],['klein','kleiner'],['schnell','schneller'],['alt','älter'],['gut','besser'],['viel','mehr']],
  [{german:'Mein Fahrrad ist schneller als deins.',russian:'Мой велосипед быстрее твоего.'}],
  [['Сравнительная степень: klein','kleiner','К основе klein добавляем -er.'],['Сравнительная степень: alt','älter','В форме älter появляется умлаут.'],['Вставьте союз: Anna ist älter ___ Paul.','als','После сравнительной степени при неравенстве используем als.'],['Сравнительная степень: gut','besser','Gut имеет особую форму besser; guter неверно.']]),
];
export const grammarTopics: GrammarTopic[] = [
 ...legacyTopics.map(topic => extendLegacy(topic, basicSupplements[topic.id])),
 ...b1Topics, ...b2Topics, ...c1Topics, ...c2Topics,
];
export function makeTopic(id:string,level:Level,title:string,explanation:string,table:string[][],examples:GrammarTopic['examples'],items:[string,string,string][]):GrammarTopic {
 const exercise = ([prompt,answer,reason]:[string,string,string],index:number):GrammarExercise => ({id:`${id}-${index+1}`,prompt,answer,explanation:reason});
 return {id,level,title,explanation,table,examples,exercises:items.slice(0,3).map(exercise),finalTest:items.slice(3).map((item,index)=>exercise(item,index+3))};
}


