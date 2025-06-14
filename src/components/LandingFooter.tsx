
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LandingFooter = () => {
  const footerSections = [
    {
      title: "Smart Cart",
      links: ["About Us", "How It Works", "Privacy Policy", "Terms of Service"]
    },
    {
      title: "SNAP Resources",
      links: ["SNAP Eligibility", "EBT Store Locator", "Nutrition Guidelines", "Application Help"]
    },
    {
      title: "Support",
      links: ["Contact Us", "Help Center", "Community Forum", "Report an Issue"]
    },
    {
      title: "Features",
      links: ["Price Comparison", "Meal Planning", "Store Locator", "Deal Alerts"]
    }
  ];

  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-gray-600 hover:text-green-600 text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-green-600 mr-4">Smart Cart</h3>
            <p className="text-sm text-gray-600">
              Helping families save money on groceries since 2024
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>USDA Partner</span>
            <span>•</span>
            <span>SNAP Authorized</span>
            <span>•</span>
            <span>Community Verified</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Smart Cart. All rights reserved. This site is not affiliated with USDA or state SNAP programs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
