// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div className="page-wrap py-20">
      <div className="section-card text-center">
        <h1 className="text-2xl font-bold">404</h1>
        <p className="muted mt-2">Sayfa bulunamadı.</p>
        <a className="btn btn-primary mt-4" href="/">Go Home</a>
      </div>
    </div>
  );
}
