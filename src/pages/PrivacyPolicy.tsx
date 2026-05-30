import { Tv, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Tv className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">WatchWhat?</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground text-sm mb-8 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </Link>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            Last updated: May 30, 2026
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                When you use WatchWhat?, we collect the following information:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground leading-relaxed space-y-1">
                <li>
                  <strong>Account information:</strong> Your name and email address when you sign up.
                </li>
                <li>
                  <strong>Session data:</strong> Game session codes, swipe votes, and match results.
                </li>
                <li>
                  <strong>Preferences:</strong> Your content filters (genres, providers, languages) and watchlist choices.
                </li>
                <li>
                  <strong>Referral data:</strong> Referral codes you use or share with others.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your information solely to provide and improve the WatchWhat? experience:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground leading-relaxed space-y-1">
                <li>To create and manage your account and game sessions.</li>
                <li>To match you with your partner's swipe preferences in multiplayer mode.</li>
                <li>To personalize your content recommendations and watchlist.</li>
                <li>To track referral activity and reward users who invite friends.</li>
                <li>To send you important updates about the app (you can opt out anytime).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                3. Data Sharing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We <strong>do not sell</strong> your personal data. We only share data in these limited situations:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground leading-relaxed space-y-1">
                <li>
                  <strong>With your partner:</strong> When playing multiplayer, your swipe votes are shared with the other player in your session to find matches.
                </li>
                <li>
                  <strong>Service providers:</strong> We use third-party services (such as our database provider) to host and secure your data. These providers are bound by strict confidentiality agreements.
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose information if required by law or to protect our rights.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                4. Data Retention
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your account information for as long as your account is active. Session and swipe data may be retained to support your watchlist and improve recommendations. You can request deletion of your data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                5. Your Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside mt-2 text-muted-foreground leading-relaxed space-y-1">
                <li>Access the personal data we hold about you.</li>
                <li>Update or correct your information through the app's Settings page.</li>
                <li>Delete your account and associated data.</li>
                <li>Withdraw consent for marketing communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                6. Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We take reasonable measures to protect your data, including encrypted connections and secure database storage. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                7. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                WatchWhat? is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such data, please contact us to have it removed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                8. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-display font-bold text-foreground mb-3">
                9. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                If you have any questions about this Privacy Policy or your data, please contact us:
              </p>
              <a
                href="mailto:privacy@watchwhat.app"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                privacy@watchwhat.app
              </a>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-sm text-foreground">WatchWhat?</span>
          </div>
          <p className="text-muted-foreground text-xs">
            No more "what should we watch?"
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
