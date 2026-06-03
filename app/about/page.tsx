import type { Metadata } from "next";
import {
  AboutHero,
  AboutVillage,
  BrandPurpose,
  BrandMission,
  BrandPersonality,
  BrandValues,
  BrandPromise,
  ImmersiveStorytelling,
  SignatureBrandEssence,
  AboutCTA,
  AboutFooter,
} from "@/sections/about";

export const metadata: Metadata = {
  title: "About Zalina | Our Story, Mission & Values",
  description:
    "Discover the essence of Zalina Arabian Village. Learn about our heritage, mission, and commitment to creating meaningful luxury hospitality experiences.",
  keywords: [
    "Zalina",
    "about",
    "Arabian village",
    "heritage",
    "mission",
    "values",
    "luxury hospitality",
  ],
  openGraph: {
    title: "About Zalina | Our Story, Mission & Values",
    description:
      "Discover the essence of Zalina Arabian Village. Learn about our heritage, mission, and commitment to creating meaningful luxury hospitality experiences.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="about-page-bg min-h-screen">
      {/* Gold Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`gold-particle ${i % 4 === 0 ? "gold-particle-lg" : ""}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10">
        <div
          className="max-w-[1200px] mx-auto my-8"
          style={{
            background: "rgba(15, 21, 35, 0.92)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          {/* Hero Section */}
          <AboutHero />

          {/* About Village Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <AboutVillage />
          </div>

          {/* Brand Purpose Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <BrandPurpose />
          </div>

          {/* Brand Mission Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <BrandMission />
          </div>

          {/* Brand Personality Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <BrandPersonality />
          </div>

          {/* Brand Values Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <BrandValues />
          </div>

          {/* Brand Promise Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <BrandPromise />
          </div>

          {/* Immersive Storytelling Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <ImmersiveStorytelling />
          </div>

          {/* Signature Brand Essence Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <SignatureBrandEssence />
          </div>

          {/* CTA Section */}
          <div
            className="px-6 lg:px-12"
            style={{
              paddingTop: "96px",
              paddingBottom: "96px",
            }}
          >
            <AboutCTA />
          </div>

          {/* Footer */}
          <AboutFooter />
        </div>
      </div>
    </main>
  );
}
