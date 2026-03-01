import { SavedBookCard } from "./SavedBookCard";
import type { SavedBook } from "./SavedBookCard";

const savedBooks: SavedBook[] = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzuoO6QUj95kVFZhloHrVHvSRdAPqFEVyyJdkT2RBpjydphiKAF2PG2_5ZuP9Pid3a07mKlyZkCnbATvrem7kWaYeF_Hp-HKf7utqgPVUxb0GquQdP_MU_JN6Rokz0Ib1muMfPjkt7JY1fRatBfdLBOUTG2YBSnH5oLxzEtc2Sp4gVZrrbluC4SsxFjp7FsFg_YupYW8sS0eDOwQZRrj-Qa4MUCmVyQ6Pxg6WCPQPecr44sZQDyW9CurJzdY0cBFqVu6Xb5ziZwEHI",
    },
    {
        title: "Dune",
        author: "Frank Herbert",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsdeVWVbUgJZiN1TnjTSGYXJN5wAsJ8zJL0s9UW3ZLVmLB4BB6wn8ccjNqXkCKS23vIH1Tv8ACrYRgRYCGvBvMzfQzKydH9hdh9fnKb0N_-pN5jjFlJL_XLD-d_Zix_X5MNGRC-zoaXBi9cyI-FMpLYfl06ekqClEWXToI_Mil_r8nVJhjYJ-wL9xcP1k87TotbPygpVU8n7xQNC3gYwnaB5U6VUhyLNzdsOujFZRAbZF9qP50JRzitPIfbv2acH8mm0SfxVgIduVg",
    },
    {
        title: "Project Hail Mary",
        author: "Andy Weir",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRm9K6FCu-EhR8C5mpw1wfhsKsBLSWui86hp5L0VSTcfkMAmcaqnfhoUzyEeCWEYv6f537yC1marY2Jem3E6aBmt-C-xGC0YBOOTga05kM6trdJQOaJYbW-Ze3tpgHv2CCfM20Cjo-pUO07XNnEm22ZH1ftSH1a_s_G9s9X46-h8jMpeaYh8a5G9ClQSqrv8WRK3gwUJ4B41uEpuZLI94QaCPBFihKMfRP9S1FeBXgOMVGhrApfZvBUkuwoBnDRjMvVc8n_hN2WNfm",
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDxX6lGXKLHGuny3-Zv5Md_UUe9g9qcq-w7GeT1BJ7-osO72DH5N2vEdrftFoIvAoyan2k3weg4dyJEG0Eu1yPsL2cFy1gHU6hcAQV38UqGA4LcrEN2bc7Qx15Y0nZt-7DuqBvEEw3bdVPavcJV2oZtfHsyokt0aJPrufbJd-VPJHHfJNFjYA4fSkxjX68vPoXbrWu55byD_CVGhrL5c5z3ukjHJ5s7wfnzIGRNh7bg686bOhVQ6qg4wdCgaQP_Nxo5RyK575WIMPm",
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBF4gAT8IMJa5Bvkzz8Iw8qSUwEso036S-0Fn8jsTVduySHxkENwXRXGd9T4YoNjZZ-4J2jJdH5y-RaN-Ld-n66JXiKLIZ-jIwfH0Dv74gq_ykOJWmRn2NvlcW69GeePw3Vs-U-ugo6LaLWWYvX1HRTrJgyA_yLdf6ovpdMyMX1iLjUERF_VpCiRawGzLb9rp_F8lm1gVGYcXvzpn1ei_xnC9FrhgKLcH2I9kFbzTnIImNVI-Cbh5h8mf_kAcAtGYvKa0FEt6-bh6tc",
    },
];

export function SavedBooksGrid() {
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
                {savedBooks.map((book) => (
                    <SavedBookCard key={book.title} book={book} />
                ))}
            </div>
            <div className="mt-12 text-center">
                <button className="text-sm text-neutral-600 hover:text-primary font-medium transition-colors">
                    Load more books...
                </button>
            </div>
        </>
    );
}
