import Hero from "@/components/Home/Hero";
import HowItWorksSection from "@/components/ui/common/how-it-works";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero></Hero>
      <HowItWorksSection></HowItWorksSection>
    </div>
  );
}
