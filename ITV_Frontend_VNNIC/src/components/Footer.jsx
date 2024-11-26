import { FaFacebook, FaYoutube } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="bg-customBlue  text-center text-white py-5 font-sans">
      <div>
        <a className="uppercase font-bold text-2xl">
          Trung tâm Internet Việt Nam
        </a>
        <div className="pt-3 space-x-2">
          <a>Địa chỉ:</a>
          <a className="font-semibold  text-white">18 Nguyễn Du, Hà Nội</a>
        </div>
        <div className="space-x-2">
          <a>Email:</a>
          <a className="text-red-500">domain-support@vnnic.vn</a>
        </div>
        <a>Kết nối với chúng tôi</a>
        <div className="social-icons flex items-center justify-center space-x-4 ">
          <a
            className="hover:scale-150 transition-transform duration-300"
            target="_blank"
            href="https://www.facebook.com/myVNNIC/"
          >
            <FaFacebook />
          </a>
          <a
            className="hover:scale-150 transition-transform duration-300"
            target="_blank"
            href="https://www.youtube.com/channel/UCLvuvINvucsfLAPrasmz9Cw"
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </div>
  );
};
export default Footer;
