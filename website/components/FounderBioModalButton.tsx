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
            With a legacy spanning over 50 years, Sam Gaines is the foundational pillar of the Gaines Boxing Club. A native of St. Louis, Mr. Gaines established himself as a formidable force in the ring early in his career, becoming a three-time Golden Gloves champion between 1967 and 1969. After competing as a professional fighter, he transitioned his passion for the sport into a lifelong commitment to nurturing fighters and wrestlers across Missouri.
          </p>
          <p style={{ marginBottom: "1rem" }}>
            What began in the basement of his home eventually grew into a storied institution. Mr. Gaines is renowned for teaching the &quot;East St. Louis style&quot; of boxing&mdash;a high-pressure, relentless approach characterized by a &quot;never back up&quot; mentality and constant forward motion. Beyond the technicalities of the sport, he served as a vital protector for his fighters, guiding them away from &quot;sharks&quot; and bad business while providing the wisdom to stay on the &quot;straight and narrow&quot; path.
          </p>
          <p>
            Though he officially retired in 2019, passing the torch to his longtime pupils Steve Thompson and Jesse Bryan, his &quot;no excuses&quot; philosophy remains the heartbeat of the gym. His legacy is one of truth, respect, and the belief that the discipline of boxing can transform life&apos;s frustrations into controlled, productive power.
          </p>
        </div>
      ),
      size: "lg",
    });
  };

  return (
    <button type="button" onClick={openBioModal} className={className}>
      {children}
    </button>
  );
}
