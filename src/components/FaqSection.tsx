import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "./SectionHeader";

export const FaqSection = ({ items }: { items: { q: string; a: string }[] }) => (
  <section className="container py-20">
    <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
    <div className="reveal max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="space-y-3">
        {items.map((it, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="bg-surface border border-border rounded-xl px-5 shadow-card"
          >
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
