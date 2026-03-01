export function ComingSoonBanner() {
    return (
        <section className="mt-8 mb-8 p-8 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/10">
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-primary uppercase bg-primary/10 rounded-full">
                        Coming Soon
                    </span>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
                        The Future of AI in Fiction
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                        An exclusive collection exploring how artificial
                        intelligence is reshaping storytelling. Pre-order to get
                        early access to interviews with top sci-fi authors.
                    </p>
                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                        Notify Me
                    </button>
                </div>
                <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden bg-neutral-200 relative group">
                    <img
                        alt="AI Fiction Banner"
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXf1tvMebe61YBNsiotB4kX7EUCfPoIh0psxe4tI77ky4CoomTtcB1iP2es3y1v0D67XkWxEVS2srqOLeHsDVYyLv4IPqpFN1KzjowPVB0Px23NF7y47gSvaurCM7VtjW41N4N1CxSPssKs-lcl1zCpqol5EWf8WXOoX34E_CN0i17mN3_rrS9OQQc-wNBJMmxSWvdEK1HCukMCaGz7XJMotAW5Beg48saaYzqiGaUNcpjseAl0lH0GaBI0y9gVRlc9or4FKFR7Vmw"
                    />
                </div>
            </div>
        </section>
    );
}
