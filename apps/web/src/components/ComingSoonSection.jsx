import { motion } from "framer-motion";
import {
  ShieldCheck,
  Scale,
  FileText,
  Brain,
  CreditCard,
  BadgeCheck,
  MessageSquare,
  Bell,
} from "lucide-react";

const features = [
  {
    title: "Rental Credit Score",
    description: "Know your tenant or landlord before you commit",
    icon: ShieldCheck,
  },
  {
    title: "Dispute Resolution",
    description: "Resolve rental issues without stress",
    icon: Scale,
  },
  {
    title: "Smart Agreement Builder",
    description: "Generate complete legal agreements with AI",
    icon: FileText,
  },
  {
    title: "AI Risk Detection",
    description: "Spot hidden risks before signing",
    icon: Brain,
  },
  {
    title: "Rent Payment Tracker",
    description: "Track rent and payment records easily",
    icon: CreditCard,
  },
  {
    title: "Verified Listings",
    description: "Only trusted tenants and properties",
    icon: BadgeCheck,
  },
  {
    title: "Owner-Tenant Chat",
    description: "Keep communication documented",
    icon: MessageSquare,
  },
];

export default function ComingSoonSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-6xl mx-auto text-center mb-16">

        <h2 className="text-4xl font-bold mb-4">
          🚀 The Future of Renting is Coming
        </h2>

        <p className="text-gray-600 text-lg">
          RentShield is building India's most trusted rental ecosystem
        </p>

      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, i) => {
          const Icon = feature.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="relative group"
            >

              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl rounded-2xl group-hover:opacity-40 transition"></div>

              {/* Card */}
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl">

                {/* Badge */}
                <span className="inline-block text-xs font-medium bg-black text-white px-3 py-1 rounded-full mb-4">
                  Coming Soon
                </span>

                {/* Icon */}
                <div className="mb-4 text-blue-600">
                  <Icon size={34} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6">
                  {feature.description}
                </p>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg shadow-md"
                >
                  <Bell size={16} />
                  Join Waitlist
                </motion.button>

              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
