const steps = [
  {
    title: "Опишите задачу",
    text: "Своими словами: «вино на диване», «офис после корпоратива», «налёт в душевой». Поиск сам поймёт, дом это, бизнес или профи.",
  },
  {
    title: "Получите протокол и смету",
    text: "Пошаговый метод, чего делать нельзя, и ориентир цены мастера в вашем городе — в вашей валюте.",
  },
  {
    title: "Решите сами или позвоните напрямую",
    text: "Контакт компании без посредника и без комиссии. Источник рейтинга и партнёрская маркировка — открыто.",
  },
];

/** Редакционная полоса «как это работает» без карточек: гигантские номера + короткий текст. */
export function HowItWorks() {
  return (
    <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
      {steps.map((step, index) => (
        <li key={step.title} className="relative border-t border-border pt-6">
          <span className="font-display text-6xl font-extrabold leading-none tracking-[-0.06em] text-muted sm:text-7xl">
            0{index + 1}
          </span>
          <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.02em] text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
