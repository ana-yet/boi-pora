import { BookCard } from "./BookCard";
import type { Book } from "./BookCard";
import { ViewToggle } from "./ViewToggle";

const books: Book[] = [
    {
        title: "The Mindful Way",
        author: "Sarah Jenkins",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYJ-T1JuElsq1klL-5l_YzZ5KlJ_I4OAVm2_nVOe7IGGXnw5oXCImqjo2arqeeCX_bhhnYBdeul0WAMmKfMBLPfXJaRDlclneFzXjJSie0qX84yGGa6TmUV7QAPsdX6fQl0wiEWF-k9A1EgV89SibhBI_ucJkj0nBk_cZySVhf7Ib5KC1BAaxOpWYhKARKQqOwsrV6KqSemVxE9imW4uw6iXaTWM9_Y6dO56drwZSvEWTOf5Ef60BMdBbs6AijcuB6J8AX8y5VSPWO",
        rating: "4.8",
        duration: "5h 20m",
        tags: [
            { label: "Self-help" },
            { label: "New", variant: "accent" },
        ],
    },
    {
        title: "Design Systems",
        author: "Alla Kholmatova",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLZsa1uSSKGCZByjKv3I4MzxZv6xx7SryHTR4_aZH7jKNeT33WpMUblYraylBjmoeXpRH-4SYKyD8KLM-cGcNuOQ5tRMJ7jn4vd0UX9xQ74-BSSSXNMWfXxtYuIGyhMhdUe1iaMHG9qNpR8pCp_O-KOen_S8EwXsDksPROc2vuvcqJOIgOPax39A9G_V-jDdFeMF7Fnl8P9HoJQjbRobEOlFazPamTiRrJmf3eK406rusU6Rz0WbyMF-X-pK4JUvP1HeOyS72LmdQ9",
        rating: "4.9",
        duration: "8h 15m",
        tags: [{ label: "Tech" }],
    },
    {
        title: "The Ancient City",
        author: "Fustel de Coulanges",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwz-4X1ibIIciz6mzinUigQB9yXzXCG7wrhNtEsUV7wPZWiJdG8YVli1md5IXKqve8htIlWnV5HhV3Yc2vlgO7KBu9chQ6iq47z19RJ4zo4BZbR8paLGT0eExYhB0g3mIQxOWFBATsAiiHk4XB58eo9T5h_OZYdHEWNxvl5Bzpp6CIgJTB5CLjogNi095udgcGwj3AWxGwy6mY95vr1tsfybVHUAXxVPK84CzQgTwNer-w_4muec0EBUpYA9jJRtSlFCbtAjwXB_Bc",
        rating: "4.5",
        duration: "12h 45m",
        tags: [{ label: "History" }],
    },
    {
        title: "Quiet Mornings",
        author: "Elara Vance",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbsV4rsvc2tYLvizfDLIA0ysxQtHLCGaU_IdOYLCTvnzD_Gb3Co2AiuY2iSYcNIuuU8JNWSEHu2xjW5Wfxjn8lK9bZutvADK87jt7wD9YAABWKSBSlTW-4fbhmMZnxSrieRq6hLm4y8FFFkyWvjeO2rIg5MAOFoa7_AAG0egrRkVbT0smReSG3GBoseZcct7qtGPWC0o_6TYKj3SA6N3yr05DJZ39yZcCvOZw79sS6bYtZ2xL2GJ6BbivBsHwtbtDxSSp5oxjwZyrh",
        rating: "4.7",
        duration: "6h 10m",
        tags: [{ label: "Lifestyle" }],
    },
];

export function BookGrid() {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                    Recommended for you
                </h2>
                <ViewToggle />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {books.map((book) => (
                    <BookCard key={book.title} book={book} />
                ))}
            </div>
        </section>
    );
}
