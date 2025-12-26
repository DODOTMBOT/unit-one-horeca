export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-[#1e1b4b]">
      <h1 className="text-4xl font-black uppercase mb-10 tracking-tighter">
        Публичная оферта
      </h1>
      
      <div className="prose prose-slate max-w-none font-medium leading-relaxed">
        <p className="mb-10 text-indigo-600 uppercase font-black tracking-[0.2em] text-[10px] bg-indigo-50 inline-block px-3 py-1 rounded-md">
          Редакция от 26.12.2025
        </p>

        <p className="text-sm text-slate-500 mb-8 italic">
          Настоящий документ является официальным предложением (публичной офертой) индивидуального предпринимателя Арутюнова Эмиля Вагифовича, адресованным неопределённому кругу лиц, заключить договор на изложенных ниже условиях. В соответствии со статьёй 437 Гражданского кодекса Российской Федерации настоящий документ является публичной офертой. Акцепт оферты означает полное и безоговорочное принятие условий настоящего договора.
        </p>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            1. Общие положения
          </h2>
          <div className="space-y-4 text-slate-600">
            <p>1.1. Индивидуальный предприниматель Арутюнов Эмиль Вагифович, ОГРНИП 323508100548341, ИНН 502806496938, зарегистрированный по адресу: г. Можайск, ул. Бородинская, д. 16, далее — Оператор платформы, размещает настоящую публичную оферту в информационно-телекоммуникационной сети Интернет.</p>
            <p>1.2. Оператор платформы является владельцем и администратором онлайн-платформы, расположенной по адресу <span className="text-indigo-600 font-bold">https://unit-one.ru</span>, предоставляющей доступ к цифровым продуктам, услугам и решениям для сферы HoReCa.</p>
            <p>1.3. Лицо, осуществившее акцепт настоящей оферты, далее именуется Пользователь.</p>
            <p>1.4. Акцептом оферты признаётся совершение Пользователем действий, направленных на приобретение продукта или услуги на платформе, включая оплату выбранного продукта.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            2. Предмет договора
          </h2>
          <div className="space-y-4 text-slate-600">
            <p>2.1. Оператор платформы предоставляет Пользователю доступ к функционалу платформы, а также к цифровым продуктам, услугам и проектным решениям, размещённым на платформе.</p>
            <p>2.2. Продукты и услуги, размещённые на платформе, могут предоставляться:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>непосредственно Оператором платформы;</li>
              <li>третьими лицами, размещающими свои продукты и услуги через платформу, если это прямо указано в описании конкретного продукта.</li>
            </ul>
            <p>2.3. Все продукты, размещённые на платформе, относятся к цифровым товарам, цифровым услугам или результатам интеллектуальной деятельности и не предполагают физической доставки.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            3. Порядок заключения договора
          </h2>
          <div className="space-y-4 text-slate-600">
            <p>3.1. Договор считается заключённым с момента акцепта оферты Пользователем.</p>
            <p>3.2. Акцепт осуществляется путём оплаты выбранного продукта или услуги на платформе.</p>
            <p>3.3. Совершая акцепт, Пользователь подтверждает, что: ознакомился с условиями настоящей оферты; понимает характер приобретаемых цифровых продуктов и услуг; принимает условия оферты в полном объёме.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            4. Стоимость и порядок оплаты
          </h2>
          <div className="space-y-4 text-slate-600">
            <p>4.1. Стоимость каждого продукта или услуги указывается на соответствующей странице платформы.</p>
            <p>4.2. Оплата осуществляется исключительно в безналичной форме, путём онлайн-оплаты банковской картой.</p>
            <p>4.3. Моментом оплаты считается поступление денежных средств на расчётный счёт Оператора платформы либо платёжного агрегатора.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            5. Порядок предоставления продуктов и услуг
          </h2>
          <div className="space-y-4 text-slate-600">
            <p>5.1. Формат предоставления продукта или услуги определяется описанием конкретного продукта и может включать: мгновенный доступ к цифровым материалам; асинхронное выполнение на основании предоставленных Пользователем данных; проектную работу с передачей результата в установленном формате.</p>
            <p>5.2. Момент начала оказания услуги или предоставления доступа определяется фактическим предоставлением доступа либо началом исполнения обязательств.</p>
          </div>
        </section>

        <section className="mb-12 p-8 bg-red-50 rounded-[32px] border border-red-100">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight text-red-600">
            6. Возвраты и отказ от договора
          </h2>
          <div className="space-y-4 text-red-900/80">
            <p>6.1. Возврат денежных средств осуществляется в соответствии с действующим законодательством Российской Федерации.</p>
            <p>6.2. В отношении цифровых товаров и услуг применяются ограничения на возврат, установленные законом, в том числе в случае начала исполнения обязательств.</p>
            <p>6.3. Если цифровой продукт был предоставлен Пользователю в полном объёме либо начато его исполнение, возврат может быть невозможен, за исключением случаев, прямо предусмотренных законом.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            7. Права и обязанности сторон
          </h2>
          <div className="space-y-4 text-slate-600">
            <p>7.1. Оператор платформы обязуется обеспечить доступность платформы, предоставить Пользователю доступ к оплаченным продуктам и услугам.</p>
            <p>7.2. Пользователь обязуется предоставлять достоверные данные, использовать продукты и услуги исключительно в законных целях.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-black uppercase mb-4 tracking-tight border-b border-slate-100 pb-2">
            9. Персональные данные
          </h2>
          <p className="text-slate-600">
            9.1. Обработка персональных данных осуществляется в соответствии с Политикой конфиденциальности, размещённой по адресу: <br />
            <a href="https://unit-one.ru/policy" className="text-indigo-600 font-bold underline">https://unit-one.ru/policy</a>
          </p>
        </section>

        <section className="mt-20 p-10 bg-slate-50 rounded-[40px] border border-slate-100">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-indigo-500">
            11. Реквизиты Оператора
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[13px] font-bold uppercase tracking-wide">
            <div className="space-y-3">
              <p className="text-slate-400 text-[10px] font-black tracking-widest">Исполнитель</p>
              <p className="text-[#1e1b4b]">Индивидуальный предприниматель <br /> Арутюнов Эмиль Вагифович</p>
              <p className="text-[#1e1b4b]">ИНН: 502806496938</p>
              <p className="text-[#1e1b4b]">ОГРНИП: 323508100548341</p>
            </div>
            <div className="space-y-3">
              <p className="text-slate-400 text-[10px] font-black tracking-widest">Связь</p>
              <p className="text-[#1e1b4b]">Адрес: г. Можайск, ул. Бородинская, д. 16</p>
              <p className="text-[#1e1b4b]">Тел: +7 925 530-73-30</p>
              <p className="text-[#1e1b4b]">Email: ar.em.v@yandex.ru</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}