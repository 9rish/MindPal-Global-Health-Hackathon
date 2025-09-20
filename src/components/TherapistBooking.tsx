import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Therapist, Appointment } from "../types";

interface TherapistBookingProps {
  onBack: () => void;
  userId: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

type BookingStep = "browse" | "profile" | "schedule" | "confirm" | "success";

const mockTherapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Licensed Clinical Psychologist",
    specialization: ["Anxiety", "Depression", "Trauma", "Mindfulness"],
    avatar: "👩‍⚕️",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 150,
    bio: "Dr. Chen specializes in cognitive-behavioral therapy with over 8 years of experience helping individuals overcome anxiety and depression. She integrates mindfulness practices into her therapeutic approach.",
    languages: ["English", "Mandarin"],
    verified: true,
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", timezone: "PST" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", timezone: "PST" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", timezone: "PST" },
    ]
  },
  {
    id: "2", 
    name: "Dr. Marcus Johnson",
    title: "Licensed Marriage & Family Therapist",
    specialization: ["Couples Therapy", "Family Counseling", "Communication"],
    avatar: "👨‍⚕️",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 140,
    bio: "Dr. Johnson focuses on strengthening relationships and improving communication patterns. He uses evidence-based approaches to help couples and families build stronger connections.",
    languages: ["English", "Spanish"],
    verified: true,
    availability: [
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", timezone: "EST" },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", timezone: "EST" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "15:00", timezone: "EST" },
    ]
  },
  {
    id: "3",
    name: "Dr. Amara Patel", 
    title: "Licensed Clinical Social Worker",
    specialization: ["Stress Management", "Work-Life Balance", "Self-Esteem"],
    avatar: "👩‍⚕️",
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 125,
    bio: "Dr. Patel helps professionals manage stress and achieve better work-life balance. She specializes in solution-focused therapy and stress reduction techniques.",
    languages: ["English", "Hindi"],
    verified: true,
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "16:00", timezone: "PST" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "16:00", timezone: "PST" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "16:00", timezone: "PST" },
    ]
  }
];

export function TherapistBooking({ onBack, userId, isPremium, onUpgrade }: TherapistBookingProps) {
  const [step, setStep] = useState<BookingStep>("browse");
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [sessionType, setSessionType] = useState<"video" | "phone" | "chat">("video");
  const [isBooking, setIsBooking] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Load existing appointments
    const saved = localStorage.getItem("mindpal-appointments");
    if (saved) {
      setAppointments(JSON.parse(saved));
    }
  }, []);

  if (!isPremium) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl text-center">
            <div className="text-6xl mb-6">👑</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Premium Feature: Professional Therapy
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with licensed mental health professionals for personalized support and guidance. Available with MindPal Premium.
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">What's Included:</h3>
              <ul className="text-left text-sm text-gray-700 space-y-2">
                <li>• Video, phone, or chat sessions</li>
                <li>• Licensed & verified therapists</li>
                <li>• Flexible scheduling</li>
                <li>• Secure & private conversations</li>
                <li>• Session notes & progress tracking</li>
              </ul>
            </div>

            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium"
            >
              Upgrade to Premium
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleBookAppointment = async () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) return;

    setIsBooking(true);
    
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const appointment: Appointment = {
      id: Date.now().toString(),
      userId,
      therapistId: selectedTherapist.id,
      date: new Date(selectedDate),
      duration: 50,
      status: "scheduled",
      sessionType,
      price: selectedTherapist.hourlyRate,
      meetingUrl: sessionType === "video" ? "https://meet.mindpal.com/session-" + Date.now() : undefined
    };

    const updatedAppointments = [...appointments, appointment];
    setAppointments(updatedAppointments);
    localStorage.setItem("mindpal-appointments", JSON.stringify(updatedAppointments));

    setIsBooking(false);
    setStep("success");
  };

  if (step === "browse") {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                onClick={onBack}
                variant="ghost"
                className="mb-4 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </Button>
              <h1 className="text-3xl text-gray-800 font-medium">
                Professional Therapy
              </h1>
              <p className="text-gray-600">
                Connect with licensed mental health professionals
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {mockTherapists.map((therapist) => (
              <motion.div
                key={therapist.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl cursor-pointer hover:shadow-xl transition-all"
                     onClick={() => {
                       setSelectedTherapist(therapist);
                       setStep("profile");
                     }}>
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl">{therapist.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{therapist.name}</h3>
                        {therapist.verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{therapist.title}</p>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">{therapist.rating}</span>
                          <span className="text-sm text-gray-500">({therapist.reviewCount})</span>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ${therapist.hourlyRate}/session
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {therapist.specialization.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {therapist.specialization.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{therapist.specialization.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Existing Appointments */}
          {appointments.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-medium text-gray-800 mb-6">
                Your Appointments
              </h2>
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const therapist = mockTherapists.find(t => t.id === appointment.therapistId);
                  return (
                    <Card key={appointment.id} className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{therapist?.avatar}</div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{therapist?.name}</h3>
                            <p className="text-sm text-gray-600">
                              {appointment.date.toLocaleDateString()} at {appointment.date.toLocaleTimeString()}
                            </p>
                            <Badge className={`text-xs ${
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                        {appointment.status === 'scheduled' && (
                          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
                            Join Session
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === "profile" && selectedTherapist) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={() => setStep("browse")}
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back to Therapists
          </Button>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <div className="flex items-start space-x-6 mb-6">
              <div className="text-8xl">{selectedTherapist.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{selectedTherapist.name}</h1>
                  {selectedTherapist.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      ✓ Verified Licensed Professional
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-gray-600 mb-4">{selectedTherapist.title}</p>
                
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="font-semibold">{selectedTherapist.rating}</span>
                    <span className="text-gray-500">({selectedTherapist.reviewCount} reviews)</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedTherapist.hourlyRate}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTherapist.specialization.map((spec) => (
                      <Badge key={spec} className="bg-purple-100 text-purple-800">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                  <div className="flex space-x-2">
                    {selectedTherapist.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">About</h3>
              <p className="text-gray-700 leading-relaxed">{selectedTherapist.bio}</p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setStep("schedule")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium text-lg"
              >
                Book Appointment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === "schedule" && selectedTherapist) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => setStep("profile")}
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back to Profile
          </Button>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Schedule with {selectedTherapist.name}
            </h2>

            {/* Session Type */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Session Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "video", icon: "📹", label: "Video Call" },
                  { type: "phone", icon: "📞", label: "Phone Call" },
                  { type: "chat", icon: "💬", label: "Text Chat" }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setSessionType(option.type as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      sessionType === option.type
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Select Date</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i + 1);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{date.toLocaleDateString('en', { weekday: 'short' })}</div>
                      <div className="text-lg font-bold">{date.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-800 mb-3">Select Time</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedTime === time
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium">{time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary & Book */}
            {selectedDate && selectedTime && (
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Therapist:</span>
                    <span className="font-medium">{selectedTherapist.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span className="font-medium">
                      {selectedDate.toLocaleDateString()} at {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Type:</span>
                    <span className="font-medium capitalize">{sessionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">50 minutes</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>${selectedTherapist.hourlyRate}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || isBooking}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium text-lg"
                >
                {isBooking ? (
                    <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Booking...</span>
                    </div>
                ) : (
                    "Book Appointment"
                )}
                </Button>
            </div>
          </Card>   {/* ✅ close Card */}
        </div>     {/* ✅ close max-w-2xl wrapper */}
      </div>
    )}
}