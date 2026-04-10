"use client";

import { useModal } from "@/components/ModalProvider";
import React from "react";
import { Icon } from "@iconify/react";

export function CoachBioModalButton({
  coach,
  children,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coach: Record<string, any>;
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useModal();

  const openBioModal = () => {
    // Determine which bio content to render:
    // If fullBio (richText from Payload) is available and has content, render it.
    // Otherwise fall back to shortBio.
    let bioContent: React.ReactNode;

    if (coach.fullBio && typeof coach.fullBio === 'object') {
      // Payload richText stores as Lexical JSON. For now, we extract text nodes.
      // A future improvement would use @payloadcms/richtext-lexical/react RichText component.
      const extractText = (node: Record<string, unknown>): string => {
        if (node.text && typeof node.text === 'string') return node.text;
        if (Array.isArray(node.children)) {
          return (node.children as Record<string, unknown>[])
            .map(extractText)
            .join('');
        }
        return '';
      };

      const root = (coach.fullBio as Record<string, unknown>).root as Record<string, unknown> | undefined;
      if (root && Array.isArray(root.children)) {
        bioContent = (root.children as Record<string, unknown>[]).map((block, i) => {
          const text = extractText(block);
          if (!text) return null;
          return <p key={i} style={{ marginBottom: "1rem" }}>{text}</p>;
        });
      } else {
        bioContent = <p style={{ marginBottom: "1.5rem" }}>{coach.shortBio}</p>;
      }
    } else {
      bioContent = <p style={{ marginBottom: "1.5rem" }}>{coach.shortBio}</p>;
    }

    const fullName = coach?.name ?? '';
    const nameParts = fullName.split(' ');

    open({
      subtitle: coach.role,
      title: (
        <>
          {nameParts[0]}{" "}
          <span style={{ color: "#c14e01" }}>
            {nameParts.slice(1).join(" ")}
          </span>
        </>
      ),
      body: (
        <div>
          {bioContent}

          {coach.certifications && coach.certifications.length > 0 && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <p
                style={{
                  color: "#c14e01",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "0.5rem",
                }}
              >
                Certifications &amp; Honors
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                {coach.certifications.map((cert: { label: string }, i: number) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Icon
                      icon="material-symbols:verified"
                      style={{ fontSize: "16px", color: "#c14e01" }}
                    />{" "}
                    {cert.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
