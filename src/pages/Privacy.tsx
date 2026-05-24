import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
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
              Privacy Policy
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
                  At Bami Hustle, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">1. Information We Collect</h2>
                <div className="space-y-4 text-slate-300">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Personal Information You Provide:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Account registration details (name, email, phone number)</li>
                      <li>Profile information (business details, location, preferences)</li>
                      <li>Payment and billing information</li>
                      <li>Communication preferences and contact information</li>
                      <li>Documents and files you upload to the platform</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Information Collected Automatically:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage data (pages visited, time spent, features used)</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Location data (if permitted)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Information */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>To create and maintain your account</li>
                  <li>To process transactions and send related information</li>
                  <li>To send promotional communications (with your consent)</li>
                  <li>To improve our services and user experience</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To comply with legal obligations</li>
                  <li>To prevent fraud and ensure platform security</li>
                  <li>To analyze usage patterns and trends</li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">3. Information Sharing and Disclosure</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>With service providers who assist in operating our website and conducting our business</li>
                  <li>When required by law or government requests</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>With your explicit consent</li>
                </ul>
              </div>

              {/* Data Security */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">4. Data Security</h2>
                <p className="text-slate-300 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">5. Your Privacy Rights</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                  <li>The right to access your personal information</li>
                  <li>The right to correct inaccurate information</li>
                  <li>The right to delete your information</li>
                  <li>The right to opt-out of certain data uses</li>
                  <li>The right to data portability</li>
                </ul>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">6. Cookies and Tracking</h2>
                <p className="text-slate-300 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences. Note that disabling cookies may affect some features of our service.
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">7. Children's Privacy</h2>
                <p className="text-slate-300 leading-relaxed">
                  Bami Hustle is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
                </p>
              </div>

              {/* Third-Party Links */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">8. Third-Party Links</h2>
                <p className="text-slate-300 leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any personal information.
                </p>
              </div>

              {/* Policy Changes */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-white">9. Changes to This Privacy Policy</h2>
                <p className="text-slate-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our service constitutes your acceptance of the updated policy.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-400/30">
                <h2 className="text-2xl font-bold mb-4 text-white">10. Contact Us</h2>
                <p className="text-slate-300 leading-relaxed">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us at:
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

export default Privacy;
