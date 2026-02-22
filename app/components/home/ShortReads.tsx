export function ShortReads() {
    const books = [
        {
            title: "The Little Prince",
            author: "Antoine de Saint-Exupéry",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB3eRYcFz20CGkAVrAX-6mYPc0yP7nAUwv8eJps8JXjJLD8SCTnawi5EA7pxSP16DReqGSrj1Vs_7YInPd-tTu6PE3Ua5jZWRUsdEMYyNHHJCkffoBiP6DvQD-Zi-Zk5cc2CkwIjc3Uy2_zjqNxVxo7wguwL5IgNqdm8LFtP_rb0jFbS_v0iLCQPy3ONwj9_DSiLw3VK8wquoNWAH4y0sOv0yZ342F8JZQgsrYNkxeAK29NVY5airrTq1TURcKmNh4CxPgxm_ZWRDG",
            rating: "4.9",
            time: "1h 45m",
            classes: "flex"
        },
        {
            title: "The Art of War",
            author: "Sun Tzu",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCj6c7xqtZGY5bdDkCshCKcjP8Fos3Cv-eMeHky-RAq7RJ_3KGqpCEV1u7uPf4U0UdQRbh7Yw4KKeGvsGT2dBIV9edEq6nMHgs_UyDld6xrYbkEy4Ac9t84WCp7s-TLjUAkURX2Bx-4I2qiKj5sXXffNJMTiEFXH7aIxmqOYIdeGImsWTbcSvGficgJGPOIynS7b868F_2PP6D59ri8AahsaJEUszyBG_XOXtgAwNYPgZJNm1SzM9vI28Ej9UOZWxxJA0eTLFwfhckv",
            rating: "4.7",
            time: "1h 12m",
            classes: "flex"
        },
        {
            title: "Animal Farm",
            author: "George Orwell",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYVG20LJ5ySE6hDGj4kUxMWUc-Gg1PxJ3C4nnJk8owIZg6jV80wYeNyCx-Ptrh6TIiuqG2HdIKcdHW2qYj75f4r4rkZb3GGOgs5V3Ehm9onNtl8OZYY2tPKQDVWvEHPQEdh8U3vgenulHrgppU8seEd6AjGJ2Croay0A8Mi1uIILRdo-faNGZtTfDyu_PO7tkR1QW8aVXGSB9vLBUAyHXlObC92hhEs0EghohoL99eW_qZkbiM_aOJDWREYPmzKOwkJLM2kxC-BiIY",
            rating: "4.8",
            time: "1h 55m",
            classes: "hidden lg:flex"
        }
    ];

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Short reads under 2 hours</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Perfect for your commute</p>
                </div>
                <a className="text-primary hover:text-primary-dark text-sm font-medium flex items-center" href="#">
                    View all <span className="material-icons text-sm ml-1">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book, idx) => (
                    <div key={idx} className={`bg-white dark:bg-surface-dark p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer ${book.classes}`}>
                        <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden shadow-sm mr-4">
                            <img alt={`${book.title} book cover`} className="w-full h-full object-cover" src={book.image} />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                            <div>
                                <h4 className="font-bold text-neutral-800 dark:text-white group-hover:text-primary transition-colors">{book.title}</h4>
                                <p className="text-sm text-neutral-500">{book.author}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-neutral-400">
                                <div className="flex items-center gap-1 text-primary">
                                    <span className="material-icons text-sm">star</span> {book.rating}
                                </div>
                                <span className="flex items-center gap-1">
                                    <span className="material-icons text-[14px]">schedule</span> {book.time}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
