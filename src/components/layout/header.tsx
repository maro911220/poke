import Link from "next/link";
import { Github } from "lucide-react";

export const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1 className="header-title">
          <Link href="/main">Maro/PokeDEX</Link>
        </h1>
        <a href="https://github.com/maro911220" target="_blank">
          <Github size={24} strokeWidth={2} />
        </a>
      </div>
    </header>
  );
};
