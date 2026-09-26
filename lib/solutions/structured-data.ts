import type { PriceEstimate, Solution } from "@/lib/types";
import { formatMarketCurrency } from "@/lib/format";
import { isCountryCode, getMarket } from "@/lib/markets";
import { SEVERITY_LABELS, SURFACE_LABELS } from "./meta";

export interface FaqItem {
  question: string;
  answer: string;
}

function formatEstimate(estimate: PriceEstimate): string {
  const currency = isCountryCode(estimate.countryCode) ? getMarket(estimate.countryCode).currency : undefined;
  const min = currency ? formatMarketCurrency(estimate.priceMin, currency) : `${estimate.priceMin} ${estimate.currency}`;
  const max = currency ? formatMarketCurrency(estimate.priceMax, currency) : `${estimate.priceMax} ${estimate.currency}`;
  const unit = estimate.unit ? ` за ${estimate.unit}` : "";
  const city = estimate.city ? ` в ${estimate.city}` : "";
  return `${min} – ${max}${unit}${city}`;
}

/**
 * FAQ собирается из данных решения — один источник и для UI-аккордеона, и для FAQPage JSON-LD.
 * Сметы передаются по всем рынкам, чтобы статическая страница отвечала на вопрос о цене без cookie.
 */
export function buildSolutionFaq(solution: Solution, estimates: PriceEstimate[] = []): FaqItem[] {
  const faq: FaqItem[] = [
    {
      question: `Можно ли убрать «${solution.title.toLowerCase()}» самостоятельно?`,
      answer: `Да, если случай ${SEVERITY_LABELS[solution.severity].toLowerCase()}. Протокол из ${solution.diySteps.length} шагов: ${solution.diySteps
        .map((step) => step.instruction)
        .join(" ")}`,
    },
    {
      question: "Когда лучше вызвать профессионала?",
      answer: solution.whenToCallPro,
    },
  ];

  if (solution.warnings.length > 0) {
    faq.push({
      question: "Чего нельзя делать?",
      answer: solution.warnings.join(" "),
    });
  }

  if (solution.diyCostNote) {
    faq.push({
      question: "Сколько стоит решить задачу самостоятельно?",
      answer: `Ориентировочно ${solution.diyCostNote}.`,
    });
  }

  if (estimates.length > 0) {
    faq.push({
      question: "Сколько стоит вызвать мастера?",
      answer: `Ориентир по рынкам: ${estimates.map(formatEstimate).join("; ")}.${
        solution.proTimeNote ? ` Время работы — ${solution.proTimeNote}.` : ""
      }`,
    });
  }

  return faq;
}

export function buildSolutionJsonLd(
  solution: Solution,
  url: string,
  faq: FaqItem[],
  breadcrumbs: { name: string; url: string }[]
) {
  const howTo = {
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: solution.title,
    description: solution.whenToCallPro,
    ...(solution.diyCostNote ? { estimatedCost: { "@type": "MonetaryAmount", currency: "BYN", value: solution.diyCostNote } } : {}),
    supply: (solution.recommendedProducts ?? []).map((product) => ({
      "@type": "HowToSupply",
      name: product.note ?? product.productName ?? product.brandName ?? "Профессиональное средство",
    })),
    step: solution.diySteps.map((step) => ({
      "@type": "HowToStep",
      position: step.order,
      name: `Шаг ${step.order}`,
      text: step.tip ? `${step.instruction} ${step.tip}` : step.instruction,
    })),
    about: { "@type": "Thing", name: SURFACE_LABELS[solution.surface] },
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [howTo, faqPage, breadcrumbList],
  };
}

/** Безопасная сериализация для <script type="application/ld+json"> */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
