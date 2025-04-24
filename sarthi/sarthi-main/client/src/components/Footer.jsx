import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="contact-info">
              <p>Address: Jammu</p>
              <p>Email: 2022A1R001@mietjammu.in</p>
              <p>Email: 20202A1R018@mietjammu.in</p>
            </div>
          </div>
          <div className="col-span-1">
            <div className="footer-links">
              <ul>
                <li>
                  <Link to={"/about"}>About Us</Link>
                </li>
                <li>
                  <Link to={"/"}>Home</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-span-1">
            <div className="social-media">
              <p>Follow Us: <button><Link to={"https://github.com/ruder01"}>Github</Link></button></p>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p>2023 All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
