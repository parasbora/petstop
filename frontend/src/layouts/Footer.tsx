

export default function Footer() {
  const links = [
    { name: "@parasbora_  ", url: "https://x.com/parasbora_", enabled: false },
    { name: "youtube", url: "", enabled: false },
    {
      name: "Contact us",
      url: "https://www.linkedin.com/in/parasbora",
      enabled: true,
    },
    { name: "instagram", url: "https://github.com/parasbora", enabled: true },
    { name: "twitter", url: "https://github.com/parasbora", enabled: true },
  ];
  return (
    <footer className="mt-12 text-center">
      <div className="flex justify-center space-x-4 tracking-tight">
        {links
          .filter((link) => link.enabled)
          .map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:opacity-100 transition-opacity duration-500 opacity-40 text-foreground"
            >
              {link.name}
            </a>
          ))}
      </div>
      {/* <p className="pt-2 italic text-xs text-muted-foreground opacity-50">made with 💗 by parasbora_
        </p> */}
    </footer>
  );
}
