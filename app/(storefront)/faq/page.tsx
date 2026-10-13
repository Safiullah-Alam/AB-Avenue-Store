"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How are ATELIER V automatic timepieces calibrated?",
      a: "Every movement is regulated in five positions and tested over a continuous 16-day cycle to maintain chronometer precision of -2/+4 seconds per day prior to leaving the workshop.",
    },
    {
      q: "What leather treatment is utilized for bags and folios?",
      a: "We exclusively employ Tuscan vegetable-tanning using natural tree barks and organic chestnut extracts. No synthetic silicone or heavy chrome salts are ever introduced, allowing the leather to develop a golden amber patina.",
    },
    {
      q: "What is your complimentary delivery and insurance policy?",
      a: "All dispatches above $250 qualify for complimentary courier delivery with complete door-to-door insurance coverage against loss or transit damage. Express tracking is issued via email.",
    },
    {
      q: "Can pieces be returned if the dimensions are not suitable?",
      a: "Yes. We offer a 30-day inspection period. A complimentary pre-paid return shipment label is enclosed inside every order box for effortless returns in original condition.",
    },
    {
      q: "How does lifetime atelier restoration work?",
      a: "Should your timepiece or leather piece ever require service, cleaning, or restoration, simply contact our concierge. We maintain original archival parts for every collection ever released.",
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="caption-label">Archival Inquiries</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-foreground mt-2 mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-foreground-secondary font-light">
            Insights into our calibrations, vegetable-tanned hides, and global courier dispatch.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-black/5 shadow-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-serif text-lg font-normal text-foreground pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-foreground-secondary flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden px-6 pb-6 text-xs text-foreground-secondary leading-relaxed font-light border-t border-black/5 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
