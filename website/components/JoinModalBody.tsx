"use client";

import { FormEvent } from "react";

export default function JoinModalBody({ onClose }: { onClose: () => void }) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Submission received! We will contact you shortly.");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="gbc-form-group">
        <label htmlFor="join-name">Full Name</label>
        <input
          type="text"
          id="join-name"
          placeholder="Your full name"
          required
        />
      </div>
      <div className="gbc-form-group">
        <label htmlFor="join-email">Email Address</label>
        <input
          type="email"
          id="join-email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="gbc-form-group">
        <label htmlFor="join-phone">Phone Number</label>
        <input type="tel" id="join-phone" placeholder="(555) 000-0000" />
      </div>
      <div className="gbc-form-group">
        <label htmlFor="join-experience">Experience Level</label>
        <select id="join-experience">
          <option value="beginner">Beginner -- Never boxed</option>
          <option value="intermediate">Intermediate -- Some training</option>
          <option value="advanced">Advanced -- Competition ready</option>
        </select>
      </div>
      <div className="gbc-form-group">
        <label htmlFor="join-message">Why do you want to join?</label>
        <textarea
          id="join-message"
          placeholder="Tell us about your goals..."
        ></textarea>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" className="gbc-btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="gbc-btn-primary">
          Submit Application
        </button>
      </div>
    </form>
  );
}
