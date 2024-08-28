import "./NotFoundPage.css";

function NotFoundPage() {
  return (
    <div className="not-found-container">
      <img
        src="/images/404NotFoundImage.png"
        alt="404 Not Found"
        className="not-found-image"
      />
      <h1 className="not-found-title">Oops! Page Not Found</h1>
      <p className="not-found-text">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a href="/" className="back-home-button">
        Go Back Home
      </a>
    </div>
  );
}

export default NotFoundPage;
