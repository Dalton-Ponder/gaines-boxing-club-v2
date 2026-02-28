/**
 * Gaines Boxing Club — Shared Page Scripts
 * Include after modal.js on every page.
 */

function openJoinModal() {
    GBCModal.open({
        subtitle: 'Become a Member',
        title: 'Join the <span style="color:#c14e01">Club</span>',
        body: `
            <form onsubmit="event.preventDefault(); alert('Submission received! We will contact you shortly.'); GBCModal.close();">
                <div class="gbc-form-group">
                    <label for="join-name">Full Name</label>
                    <input type="text" id="join-name" placeholder="Your full name" required />
                </div>
                <div class="gbc-form-group">
                    <label for="join-email">Email Address</label>
                    <input type="email" id="join-email" placeholder="you@example.com" required />
                </div>
                <div class="gbc-form-group">
                    <label for="join-phone">Phone Number</label>
                    <input type="tel" id="join-phone" placeholder="(555) 000-0000" />
                </div>
                <div class="gbc-form-group">
                    <label for="join-experience">Experience Level</label>
                    <select id="join-experience">
                        <option value="beginner">Beginner — Never boxed</option>
                        <option value="intermediate">Intermediate — Some training</option>
                        <option value="advanced">Advanced — Competition ready</option>
                    </select>
                </div>
                <div class="gbc-form-group">
                    <label for="join-message">Why do you want to join?</label>
                    <textarea id="join-message" placeholder="Tell us about your goals..."></textarea>
                </div>
                <div style="display:flex;gap:0.75rem;justify-content:flex-end;padding-top:0.5rem;">
                    <button type="button" class="gbc-btn-secondary" onclick="GBCModal.close()">Cancel</button>
                    <button type="submit" class="gbc-btn-primary">Submit Application</button>
                </div>
            </form>
        `,
    });
}
