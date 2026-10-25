const NotFound = () => (
  <main className="flex min-h-[100dvh] items-center justify-center px-6">
    <div className="text-center">
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">404</div>
      <h1 className="display text-4xl md:text-5xl mb-4">Lost among the stars</h1>
      <p className="mb-8 text-muted-foreground">This page doesn't exist.</p>
      <a
        href="/"
        className="inline-flex items-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-smooth focus-ring"
      >
        Return home
      </a>
    </div>
  </main>
);

export default NotFound;
