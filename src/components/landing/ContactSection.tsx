
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ContactSectionProps {
  onGetStarted: () => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ onGetStarted }) => {
  return (
    <div id="contact" className="py-24 bg-gradient-to-b from-card/40 to-card/60 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
          Ready to transform your infrastructure?
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of companies already using OrbitOps to streamline their cloud operations 
          and reduce infrastructure costs.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Get in Touch</h3>
            <p className="text-muted-foreground mb-4">hello@orbitops.net</p>
            <p className="text-muted-foreground">www.orbitops.net</p>
          </div>
          <div className="p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Start Your Journey</h3>
            <p className="text-muted-foreground mb-4">Free 14-day trial</p>
            <p className="text-muted-foreground">No credit card required</p>
          </div>
        </div>

        <Button 
          onClick={onGetStarted}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white px-12 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          Start Free Trial
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default ContactSection;
