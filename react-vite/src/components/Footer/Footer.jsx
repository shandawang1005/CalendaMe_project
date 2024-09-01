import "./Footer.css";
import { FaGithub, FaLinkedin, FaDesktop } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-content">
        <p>CalendaMe @ October Momento LLC. ©2024</p>
        <div className="footer-icons">
          <a href="https://github.com/shandawang1005" className="footer-icon">
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/shanda-wang"
            className="footer-icon"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://portifolio-rpiy.onrender.com"
            className="footer-icon"
          >
            <FaDesktop />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
