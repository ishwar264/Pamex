"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Camera,
    Mic,
    Send,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    Users,
    Monitor,
    Settings,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Layers,
    Palette,
    Factory,
    StopCircle,
    Play
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    ownerName: z.string().min(2, "Owner name is required"),
    contactNo: z.string().min(10, "Valid contact number is required"),
    email: z.string().email("Invalid email address").or(z.literal("")),
    city: z.string(),
    pinCode: z.string(),
    teamSize: z.string(),
    factoryUnits: z.string(),
    currentSystem: z.string(),
    nameOfErp: z.string(),
    stallDetails: z.string().min(1, "Stall details are required"),
    additionalRemark: z.string(),
    handleBy: z.string().min(1, "Handle by is required"),
    segmentType: z.string(),
    machineColour: z.string(),
    challenges: z.array(z.string()),
});

const CHALLENGE_OPTIONS = [
    "Quotation", "Job Card", "Inventory", "Production", "QC", "Billing", "MIS"
];

type FormValues = z.infer<typeof formSchema>;

export default function DataCollectionForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageFile2, setImageFile2] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isCustomColor, setIsCustomColor] = useState(false);
    const [isCustomSegment, setIsCustomSegment] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            ownerName: "",
            contactNo: "",
            email: "",
            city: "",
            pinCode: "",
            teamSize: "",
            factoryUnits: "",
            currentSystem: "",
            nameOfErp: "",
            stallDetails: "Hall No. 1 | Stall No. K25",
            additionalRemark: "",
            handleBy: "",
            segmentType: "",
            machineColour: "",
            challenges: [],
        },
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result?.toString().split(",")[1];
                resolve(base64String || "");
            };
            reader.onerror = (error) => reject(error);
        });
    };

    async function onSubmit(values: FormValues) {
        // Extra safety to prevent page reload
        console.log("Form values received:", values);

        setIsSubmitting(true);

        try {
            let imageBase64 = "";
            let image2Base64 = "";
            let audioBase64 = "";

            if (imageFile) imageBase64 = await fileToBase64(imageFile);
            if (imageFile2) image2Base64 = await fileToBase64(imageFile2);
            if (audioFile) audioBase64 = await fileToBase64(audioFile);

            const payload = {
                ...values,
                contactNo: values.contactNo.replace(/\D/g, ""), // Clean number for backend duplicate check
                // Legacy fields for backward compatibility with the Google Script
                cityPin: values.city && values.pinCode ? `${values.city}, ${values.pinCode}` : (values.city || values.pinCode || ""),
                teamSizeFactory: values.factoryUnits ? `${values.teamSize} (${values.factoryUnits})` : values.teamSize,
                // Adding variations to match potential Google Sheet header names
                city: values.city,
                city_name: values.city,
                pincode: values.pinCode,
                pin_code: values.pinCode,
                pin: values.pinCode,
                // Merging factory units into team size fields for scripts that only pick up one capacity column
                teamSize: values.factoryUnits ? `${values.teamSize} (${values.factoryUnits})` : values.teamSize,
                team_size: values.factoryUnits ? `${values.teamSize} (${values.factoryUnits})` : values.teamSize,
                teamsize: values.factoryUnits ? `${values.teamSize} (${values.factoryUnits})` : values.teamSize,
                factoryUnits: values.factoryUnits,
                factory_units: values.factoryUnits,
                factory_unit: values.factoryUnits,
                factory: values.factoryUnits,
                current_system: values.currentSystem,
                erp_name: values.nameOfErp,
                // Multiple variations for Stall Details to catch correct column in Google Script
                stallDetails: values.stallDetails,
                stall_details: values.stallDetails,
                stall_no: values.stallDetails,
                stallNo: values.stallDetails,
                machine_color: values.machineColour,
                imageFile: imageBase64,
                imageName: imageFile ? `img1_${Date.now()}_${imageFile.name}` : "",
                // Multiple variations for Second Image
                imageFile2: image2Base64,
                image2: image2Base64,
                image_2: image2Base64,
                imageName2: imageFile2 ? `img2_${Date.now()}_${imageFile2.name}` : "",
                audioFile: audioBase64,
                audioName: audioFile ? `audio_${Date.now()}_${audioFile.name}` : "",
            };

            const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwoAyxYm3KoT0kOO_ufgZvlvflUldlR4UK8yuIfxwLuM3H0LT8u82q5-PrSwNv1d6tBgQ/exec";

            // Use a timeout to ensure if script doesn't respond, we don't hang
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            await fetch(WEB_APP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(payload),
            });

            clearTimeout(timeoutId);

            // If we are here, the request was sent.
            // Note: with no-cors we can't be sure if it was a duplicate on the server side
            // but the new Google Script logic will prevent appending to sheet if it's a duplicate.

            toast({
                title: "Processing...",
                description: "Sending details and WhatsApp message.",
            });

            // Send Interakt WhatsApp Message
            try {
                // Clean phone number: remove non-digits
                let cleanNo = values.contactNo.replace(/\D/g, "");
                let countryCode = "+91";
                let phoneNumber = cleanNo;

                if (cleanNo.length === 12 && cleanNo.startsWith("91")) {
                    phoneNumber = cleanNo.substring(2);
                } else if (cleanNo.length === 10) {
                    phoneNumber = cleanNo;
                }

                const interaktResponse = await fetch("/api/interakt", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        phoneNumber: phoneNumber,
                        countryCode: countryCode,
                        bodyValues: [
                            `${values.ownerName}, ${values.companyName}`
                        ],
                        leadData: values
                    }),
                });

                if (interaktResponse.ok) {
                    toast({
                        title: "Entry Completed!",
                        description: "Data synced and WhatsApp sent successfully.",
                    });

                    // Capture sticky values before resetting
                    const currentStall = form.getValues("stallDetails");
                    const currentHandleBy = form.getValues("handleBy");

                    // Reset form but keep Stall Details and Handle By
                    form.reset({
                        companyName: "",
                        ownerName: "",
                        contactNo: "",
                        email: "",
                        city: "",
                        pinCode: "",
                        teamSize: "",
                        factoryUnits: "",
                        currentSystem: "",
                        nameOfErp: "",
                        stallDetails: currentStall,
                        handleBy: currentHandleBy,
                        additionalRemark: "",
                        segmentType: "",
                        machineColour: "",
                        challenges: [],
                    });

                    setImageFile(null);
                    setImageFile2(null);
                    setAudioFile(null);
                }
            } catch (whatsappError: any) {
                console.error("WhatsApp Error:", whatsappError);
            }
            setIsCustomColor(false);
            setIsCustomSegment(false);
            setRecordingTime(0);

        } catch (error) {
            console.error("Submission Error:", error);
            toast({
                title: "Error",
                description: "Something went wrong while saving data.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleImage2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile2(e.target.files[0]);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                const file = new File([audioBlob], `recording_${Date.now()}.wav`, { type: "audio/wav" });
                setAudioFile(file);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast({
                title: "Mic Error",
                description: "Could not access microphone. Please check permissions.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };


    if (!mounted) return <div className="p-8 text-center">Loading...</div>;

    return (
        <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Settings className="w-5 h-5 text-primary" />
                    Client Information Form
                </CardTitle>
                <CardDescription className="text-xs">
                    Please provide the following details for data analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Building2 className="w-3.5 h-3.5" /> Company Name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="INDUSANALYTICS PVT LTD" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <User className="w-3.5 h-3.5" /> Owner Name <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contactNo"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Phone className="w-3.5 h-3.5" /> Contact No. <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="+91 98765 43210" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Mail className="w-3.5 h-3.5" /> E Mail
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="contact@company.com" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <MapPin className="w-3.5 h-3.5" /> City
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Mumbai" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pinCode"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <MapPin className="w-3.5 h-3.5" /> Pin Code
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="400001" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="teamSize"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Users className="w-3.5 h-3.5" /> Team Size
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 50" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="factoryUnits"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Factory className="w-3.5 h-3.5" /> Factory Units
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 2 Units" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="segmentType"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Layers className="w-3.5 h-3.5" /> Segment Type
                                        </FormLabel>
                                        {!isCustomSegment ? (
                                            <Select
                                                onValueChange={(val) => {
                                                    if (val === "Custom") {
                                                        setIsCustomSegment(true);
                                                        field.onChange("");
                                                    } else {
                                                        field.onChange(val);
                                                    }
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Select Segment" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Commercial">Commercial</SelectItem>
                                                    <SelectItem value="Packaging">Packaging</SelectItem>
                                                    <SelectItem value="Corrugation">Corrugation</SelectItem>
                                                    <SelectItem value="Digital">Digital</SelectItem>
                                                    <SelectItem value="Flexo">Flexo</SelectItem>
                                                    <SelectItem value="Roto">Roto</SelectItem>
                                                    <SelectItem value="Custom">Custom...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex gap-1">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter segment"
                                                        {...field}
                                                        className="h-9"
                                                        autoFocus
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-2"
                                                    onClick={() => {
                                                        setIsCustomSegment(false);
                                                        field.onChange("");
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="machineColour"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Palette className="w-3.5 h-3.5" /> Machine Colour
                                        </FormLabel>
                                        {!isCustomColor ? (
                                            <Select
                                                onValueChange={(val) => {
                                                    if (val === "Custom") {
                                                        setIsCustomColor(true);
                                                        field.onChange(""); // Clear to let user type
                                                    } else {
                                                        field.onChange(val);
                                                    }
                                                }}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-9">
                                                        <SelectValue placeholder="Select Color" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Single">Single</SelectItem>
                                                    <SelectItem value="Double">Double</SelectItem>
                                                    <SelectItem value="Four">Four</SelectItem>
                                                    <SelectItem value="Custom">Custom...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex gap-1">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter custom colour"
                                                        {...field}
                                                        className="h-9"
                                                        autoFocus
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-2"
                                                    onClick={() => {
                                                        setIsCustomColor(false);
                                                        field.onChange("");
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentSystem"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Monitor className="w-3.5 h-3.5" /> Current System
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Excel / Manual" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nameOfErp"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 lg:col-span-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <Settings className="w-3.5 h-3.5" /> Name of ERP
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tally / SAP" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="handleBy"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 lg:col-span-1">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <User className="w-3.5 h-3.5" /> Handle By <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Representative" {...field} className="h-9" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stallDetails"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 lg:col-span-2">
                                        <FormLabel className="flex items-center gap-2 text-xs">
                                            <MapPin className="w-3.5 h-3.5" /> Stall Details <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select Stall" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Hall No. 1 | Stall No. K25">Hall No. 1 | Stall No. K25</SelectItem>
                                                <SelectItem value="Hall No. 2 | Stall No. B22">Hall No. 2 | Stall No. B22</SelectItem>
                                                <SelectItem value="Hall No. 3 | Stall No. E06">Hall No. 3 | Stall No. E06</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="bg-primary/10 my-2" />

                        {/* Challenges Section */}
                        <FormField
                            control={form.control}
                            name="challenges"
                            render={({ field }) => (
                                <div className="space-y-3 pb-2">
                                    <div className="space-y-1">
                                        <div className="text-base flex items-center gap-1 font-semibold text-foreground">
                                            <AlertCircle className="w-4 h-4 text-destructive" /> Existing Challenges
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Select all the areas where you face issues.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                                        {CHALLENGE_OPTIONS.map((item) => {
                                            const isSelected = field.value?.includes(item);
                                            return (
                                                <label
                                                    key={item}
                                                    className={`group flex flex-row items-center space-x-2 p-2 py-3 border rounded-lg transition-all cursor-pointer select-none ${isSelected
                                                        ? "bg-primary/10 border-primary ring-1 ring-primary shadow-sm"
                                                        : "hover:bg-accent border-input shadow-none"
                                                        }`}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            const currentValues = field.value || [];
                                                            if (checked) {
                                                                field.onChange([...currentValues, item]);
                                                            } else {
                                                                field.onChange(currentValues.filter((v: string) => v !== item));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm font-medium flex-1">
                                                        {item}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {form.formState.errors.challenges && (
                                        <p className="text-xs font-medium text-destructive">
                                            {form.formState.errors.challenges.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        <Separator className="bg-primary/10 my-2" />

                        {/* Remarks Section */}
                        <FormField
                            control={form.control}
                            name="additionalRemark"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Remark</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any other details you'd like to share..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator className="bg-primary/10 my-2" />

                        {/* Media Integration */}
                        {/* Media Integration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label className="text-sm flex items-center gap-2 font-semibold text-foreground">
                                    <Camera className="w-4 h-4 text-primary" /> Image 1 (Front)
                                </Label>
                                <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl bg-primary/5 hover:bg-primary/10 transition-all relative h-24">
                                    {imageFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Badge variant="secondary" className="gap-1.5 py-1 px-2 border-primary/20 bg-white/50 backdrop-blur-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                {imageFile.name.length > 20 ? imageFile.name.substring(0, 17) + "..." : imageFile.name}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => setImageFile(null)} className="text-destructive h-7 hover:bg-destructive/10">
                                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <Camera className="w-6 h-6 text-primary/60 mb-1.5" />
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                Capture Image 1
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm flex items-center gap-2 font-semibold text-foreground">
                                    <Camera className="w-4 h-4 text-primary" /> Image 2 (Back)
                                </Label>
                                <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl bg-primary/5 hover:bg-primary/10 transition-all relative h-24">
                                    {imageFile2 ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Badge variant="secondary" className="gap-1.5 py-1 px-2 border-primary/20 bg-white/50 backdrop-blur-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                {imageFile2.name.length > 20 ? imageFile2.name.substring(0, 17) + "..." : imageFile2.name}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => setImageFile2(null)} className="text-destructive h-7 hover:bg-destructive/10">
                                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <Camera className="w-6 h-6 text-primary/60 mb-1.5" />
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                Capture Image 2
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImage2Change}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm flex items-center gap-2 font-semibold text-foreground">
                                    <Mic className="w-4 h-4 text-primary" /> Voice Recording
                                </Label>
                                <div className="p-3 border-2 border-dashed rounded-xl bg-primary/5 hover:bg-primary/10 transition-all relative h-24 flex flex-col items-center justify-center">
                                    {isRecording ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1 rounded-full animate-pulse">
                                                <div className="w-2 h-2 bg-destructive rounded-full" />
                                                <span className="text-[11px] font-bold text-destructive font-mono">{formatTime(recordingTime)} Recording...</span>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    stopRecording();
                                                }}
                                                className="h-7 px-4 rounded-full"
                                            >
                                                <StopCircle className="w-3.5 h-3.5 mr-1.5" /> Stop
                                            </Button>
                                        </div>
                                    ) : audioFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Badge variant="secondary" className="gap-1.5 py-1 px-2 border-primary/20 bg-white/50 backdrop-blur-sm">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                Voice Clip Saved
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setAudioFile(null)} className="text-destructive h-7 hover:bg-destructive/10">
                                                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 w-full px-4 justify-center">
                                            <div className="flex flex-col items-center relative group cursor-pointer" onClick={startRecording}>
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <Mic className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="text-[10px] mt-1 font-semibold text-muted-foreground uppercase">Record</span>
                                            </div>

                                            <div className="w-px h-10 bg-primary/10 my-auto" />

                                            <div className="flex flex-col items-center relative group">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <Layers className="w-5 h-5 text-primary" />
                                                </div>
                                                <span className="text-[10px] mt-1 font-semibold text-muted-foreground uppercase">Upload</span>
                                                <input
                                                    type="file"
                                                    accept="audio/*"
                                                    onChange={handleAudioChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting Data...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> Submit Collection
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
