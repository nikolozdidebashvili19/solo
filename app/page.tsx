import CardStory from "@/components/CardStory";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <CardStory />
      </main>
      <SiteFooter />
    </>
  );
}
