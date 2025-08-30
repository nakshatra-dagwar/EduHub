const Footer = () => (
  <footer className="mt-12 border-t bg-white py-8">
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
              <div className="text-sm text-slate-600">&copy; {new Date().getFullYear()} EduHub. All rights reserved.</div>
      <div className="flex gap-4 mt-4 md:mt-0">
        <a className="text-sm hover:text-indigo-600">Privacy</a>
        <a className="text-sm hover:text-indigo-600">Terms</a>
      </div>
    </div>
  </footer>
);

export default Footer;
