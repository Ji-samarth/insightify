
import NavBar from "./components/NavBar";

export const metadata = {
  title: "Insightify",
  description: "Personal expense tracker - minimal frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
