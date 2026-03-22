"use client";

import { useModal } from "@/components/ModalProvider";
import React from "react";

export function FounderBioModalButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useModal();

  const openBioModal = () => {
    open({
      subtitle: "The Founder",
      title: <>Sam <span className="text-primary">Gaines</span></>,
      body: (
        <div>
          <p style={{ marginBottom: "1rem" }}>
            Before the lights and the professional rings, there was a
            Southside basement with a single heavy bag and a vision. Sam
            Gaines didn&apos;t just teach boxing; he taught survival.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            Born in 1948, Sam grew up in the toughest neighborhoods of
            the Southside. Boxing was his way out &mdash; and he made the
            most of it. After winning two consecutive Golden Gloves titles
            (1967-69) and compiling a flawless professional record of
            24-0-2, Sam turned his attention to building something that
            would outlast any championship belt.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            In 1974, he opened the doors to a 400-square-foot basement
            gym. No heat, no frills &mdash; just heart, heavy bags, and a
            promise: anyone willing to work would find a home here.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            Over the next four decades, Sam trained hundreds of amateur
            and professional fighters, producing a National Golden Gloves
            champion in 1988 and three world-title contenders by 2005. His
            philosophy &mdash; that discipline in the ring translates to
            discipline in life &mdash; became the bedrock of Gaines Boxing
            Club&apos;s identity.
          </p>
          <p>
            Today, Sam&apos;s legacy lives on through the coaches he
            mentored and the community he built. The gym has grown from
            that 400sq ft basement into a state-of-the-art facility, but
            the gritty philosophy of 1974 remains unchanged.
          </p>
        </div>
      ),
      size: "lg",
    });
  };

  return (
    <button onClick={openBioModal} className={className}>
      {children}
    </button>
  );
}
