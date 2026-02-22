import { ContinueReading } from "@/app/components/home/ContinueReading";
import { Hero } from "../components/home/Hero";
import { RecommendationRow } from "../components/home/RecommendationRow";
import { CategoryGrid } from "../components/home/CategoryGrid";

export default function HomePage() {
    return (
        <div className="animate-fade-in">
            <Hero />
            <ContinueReading />
            <RecommendationRow />
            <CategoryGrid />
        </div>
    );
}
