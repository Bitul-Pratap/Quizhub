export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/, /login/ /signup/ /signup/regindi/ /signup/regorg/",
                disallow: ["/dashboard, /quiz"]
            }
        ],
        sitemap: `${process.env.NEXT_PUBLIC_URL}/sitemap.xml`
    };
}
