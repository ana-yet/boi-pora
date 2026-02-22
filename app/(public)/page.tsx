import { ContinueReading } from "@/app/components/home/ContinueReading";
import { Hero } from "../components/home/Hero";

export default function HomePage() {
    return (
        <div className="animate-fade-in">
            <Hero />
            <ContinueReading />
        </div>
    );
}
