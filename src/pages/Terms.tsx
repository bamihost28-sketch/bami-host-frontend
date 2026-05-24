import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-96 w-96 rounded-full bg-green-600/10 blur-3xl" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-xl text-slate-300">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 space-y-8">
              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">Introduction</h2>
                <p className="text-slate-300 leading-relaxed">
                  Welcome to Bami Hustle. These Terms of Service ("Terms") govern your access to and use of our website, mobile application, and services (collectively, the "Service"). By accessing or using Bami Hustle, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use our Service.
                </p>
              </div>

              {/* Account Registration */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">1. Account Registration</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  To use certain features of Bami Hustle, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>Provide accurate, complete, and current information during registration</li>
                  <li>Maintain the confidentiality of your password and account credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized access or use of your account</li>
                  <li>Not create multiple accounts or impersonate another person</li>
                </ul>
              </div>

              {/* User Responsibilities */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">2. User Responsibilities and Conduct</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>Use the Service for illegal or unauthorized purposes</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Upload viruses, malware, or harmful code</li>
                  <li>Access or attempt to access unauthorized areas of the Service</li>
                  <li>Engage in any form of fraud or deception</li>
                  <li>Scrape, crawl, or use automated tools to access our content</li>
                  <li>Resell or redistribute access to the Service</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">3. Intellectual Property Rights</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  All content on Bami Hustle, including text, graphics, logos, images, and software, is the property of Bami Hustle or its content suppliers and is protected by international copyright laws.
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>You may not reproduce, distribute, or transmit any content without our permission</li>
                  <li>You retain ownership of content you upload, but grant us a license to use it</li>
                  <li>You are responsible for ensuring your content does not infringe third-party rights</li>
                </ul>
              </div>

              {/* User Content */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">4. User-Generated Content</h2>
                <p className="text-slate-300 leading-relaxed">
                  By uploading or submitting content to Bami Hustle, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your content. You are entirely responsible for the content you upload and assume all risks associated with it. We reserve the right to remove content that violates these Terms or is inappropriate.
                </p>
              </div>

              {/* Marketplace */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">5. Marketplace and Transactions</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If you use our marketplace features:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>You are responsible for accurate product descriptions and pricing</li>
                  <li>You must comply with all applicable laws and regulations</li>
                  <li>You agree to honest and fair dealings with other users</li>
                  <li>Bami Hustle is not responsible for disputes between buyers and sellers</li>
                  <li>All transactions are subject to our payment processing terms</li>
                </ul>
              </div>

              {/* Payments and Billing */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">6. Payments and Billing</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If you purchase services or products through Bami Hustle:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>You agree to pay all fees according to the pricing displayed</li>
                  <li>Payment processing is handled by authorized third-party processors</li>
                  <li>You authorize us to charge your payment method</li>
                  <li>Billing inquiries should be directed to our support team</li>
                  <li>All sales are final and non-refundable</li>
                </ul>
              </div>

              {/* Warranties Disclaimer */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">7. Disclaimer of Warranties</h2>
                <p className="text-slate-300 leading-relaxed">
                  Bami Hustle is provided "AS IS" without warranties of any kind. We do not warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>The Service will be uninterrupted or error-free</li>
                  <li>The Service meets your requirements</li>
                  <li>Results from using the Service will be accurate or reliable</li>
                  <li>Any defects in the Service will be corrected</li>
                </ul>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">8. Limitation of Liability</h2>
                <p className="text-slate-300 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BAMI HUSTLE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </div>

              {/* Indemnification */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">9. Indemnification</h2>
                <p className="text-slate-300 leading-relaxed">
                  You agree to indemnify and hold harmless Bami Hustle, its officers, employees, and agents from any claims, damages, or costs arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
                </p>
              </div>

              {/* Termination */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">10. Termination</h2>
                <p className="text-slate-300 leading-relaxed">
                  We reserve the right to terminate or suspend your account and access to the Service at any time, with or without cause, and with or without notice. You may also terminate your account at any time by following the account deletion procedures in your account settings.
                </p>
              </div>

              {/* Modifications to Service */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">11. Modifications to Service and Terms</h2>
                <p className="text-slate-300 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue the Service at any time. We may also update these Terms from time to time. Continued use of the Service after modifications constitutes your acceptance of the updated Terms.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">12. Governing Law and Jurisdiction</h2>
                <p className="text-slate-300 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in Delta State, Nigeria.
                </p>
              </div>

              {/* Dispute Resolution */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">13. Dispute Resolution</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Any disputes arising from these Terms or your use of Bami Hustle shall first be attempted to be resolved through informal negotiation. If resolution cannot be reached, disputes shall be resolved through binding arbitration rather than in court, except for injunctive relief.
                </p>
              </div>

              {/* Entire Agreement */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">14. Entire Agreement</h2>
                <p className="text-slate-300 leading-relaxed">
                  These Terms constitute the entire agreement between you and Bami Hustle regarding the Service and supersede all previous agreements or understandings.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-400/30">
                <h2 className="text-2xl font-bold mb-4 text-white">15. Contact Us</h2>
                <p className="text-slate-300 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 space-y-2 text-slate-300">
                  <p><strong>Email:</strong> ebamieyituoyo@gmail.com</p>
                  <p><strong>Address:</strong> Warri, Delta State, Nigeria</p>
                  <p><strong>Phone:</strong> +234 905 667 5358</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
