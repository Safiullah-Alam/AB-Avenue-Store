"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { initialSiteSettings } from "@/lib/mock-data";

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      showToast({
        type: "success",
        title: "Inquiry Received",
        message: "A concierge advisor will respond to your dispatch within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 500);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="caption-label">Private Concierge</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-foreground mt-2 mb-4">
              Connect with our Atelier
            </h1>
            <p className="text-sm text-foreground-secondary leading-relaxed font-light">
              Whether you are inquiring about horological calibrations, custom bespoke monogramming, or private gallery viewings in New York.
            </p>
          </div>

          <div className="space-y-6 pt-4 text-xs">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-card">
              <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground uppercase tracking-wider mb-1">
                  Atelier Flagship
                </h4>
                <p className="text-foreground-secondary">{initialSiteSettings.business_address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-card">
              <Mail className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground uppercase tracking-wider mb-1">
                  Electronic Dispatch
                </h4>
                <p className="text-foreground-secondary">{initialSiteSettings.contact_email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-black/5 shadow-card">
              <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground uppercase tracking-wider mb-1">
                  Concierge Desk
                </h4>
                <p className="text-foreground-secondary">{initialSiteSettings.contact_phone}</p>
                <p className="text-[11px] text-foreground-secondary mt-0.5">Mon–Fri: 09:00 – 18:00 EST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Functional Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-3xl border border-black/5 shadow-card">
          <h2 className="font-serif text-2xl font-normal text-foreground mb-2">
            Send a Private Dispatch
          </h2>
          <p className="text-xs text-foreground-secondary mb-8">
            Complete the form below and an archivist will connect with you.
          </p>

          {isSent ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h3 className="font-serif text-2xl font-normal text-foreground">
                Inquiry Dispatched
              </h3>
              <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                Thank you. We have recorded your correspondence and assigned a dedicated advisor to your inquiry.
              </p>
              <Button variant="outline" size="sm" onClick={() => setIsSent(false)}>
                Send Another Dispatch
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Subject of Inquiry"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />

              <div>
                <textarea
                  required
                  rows={5}
                  placeholder="Inquiry Details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-4 rounded-xl border border-black/10 focus:outline-none focus:border-accent text-foreground"
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                shimmer
                size="lg"
                className="w-full justify-center"
              >
                Transmit Inquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
