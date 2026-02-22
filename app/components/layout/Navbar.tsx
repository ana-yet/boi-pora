export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <span className="material-icons text-primary text-3xl">auto_stories</span>
                        <span className="font-bold text-xl tracking-tight text-neutral-800 dark:text-white">Boi Pora</span>
                    </div>
                    {/* Center Links */}
                    <div className="hidden md:flex space-x-10 items-center">
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors font-medium">
                                Categories
                                <span className="material-icons text-sm">expand_more</span>
                            </button>
                        </div>
                        <a className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors font-medium" href="#">My Library</a>
                        <a className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors font-medium" href="#">Community</a>
                    </div>
                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-icons text-neutral-400">search</span>
                            </span>
                            <input className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-white dark:bg-surface-dark focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-48 transition-all shadow-sm placeholder-neutral-400" placeholder="Search..." type="text" />
                        </div>
                        <button className="relative p-1 rounded-full text-neutral-500 hover:text-primary focus:outline-none">
                            <span className="material-icons">notifications_none</span>
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-background-dark"></span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-neutral-700 shadow-sm cursor-pointer hover:border-primary transition-colors">
                            <img alt="User avatar profile picture" className="h-full w-full object-cover" data-alt="Smiling woman profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhB1_eyG5dNlBp-E6g9G1nyom5cVNmkz802sNG9wM74qcsiOU2WzxG1--q6xYL2FfsoPJlowmqcWt-ULbZ-m-_kY621qrmJaJF8z0akNqegL--L4rJrYOMps1bIZhQ3Moc0NEtF3sbODwsNvFP4lKq6Lq9QxecojzKP7E5u4htLQ7uMf39CbY_rt_Xapy0Ret3mXx2qgklwGUP8xyKeiHbEUjwmUa51V_Avu9cb1UuUlynfKkmZLBlFpP37eXOdTgFT4p-k961qNkl" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
