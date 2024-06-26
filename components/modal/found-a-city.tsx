"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "../ui/input";
import { toast } from "@/components/ui/use-toast";
import { useModal } from "./provider";
import { FoundACitySchema } from "@/lib/schema";
import FormButton from "./form-button";
import { Textarea } from "../ui/textarea";
import { createEmailSubscriber } from "@/lib/actions";
import { EmailSubscriberInterest } from "@prisma/client";
import { useState } from "react";

export default function FoundACityModal() {
  const form = useForm<z.infer<typeof FoundACitySchema>>({
    resolver: zodResolver(FoundACitySchema),
  });

  const [loading, setLoading] = useState(false);

  const modal = useModal();

  async function onSubmit(data: z.infer<typeof FoundACitySchema>) {
    try {
      setLoading(true);
      await createEmailSubscriber({
        ...data,
        indicatedInterest: EmailSubscriberInterest.FOUND,
      });
      toast({
        title: "Thanks!",
      });
      modal?.hide();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full rounded-md border-gray-850 bg-gray-200/70  backdrop-blur-xl dark:bg-gray-900/80 md:max-w-lg md:border md:shadow dark:md:border-gray-700"
      >
        <div className="relative flex flex-col space-y-4 p-5 text-gray-850 dark:text-gray-200 md:p-10">
          <h2 className={"mb-2 font-serif text-2xl font-light"}>
            Found a new city
          </h2>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name *</FormLabel>
                <Input
                  className="border-gray-700 dark:border-gray-300"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Email *</FormLabel>
                <Input
                  className="border-gray-700 dark:border-gray-300"
                  type="email"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tell us about your idea for a city. (Optional) 
                </FormLabel>
                <Textarea
                  className="border-gray-700 dark:border-gray-300"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end rounded-b-lg border-t border-gray-700 bg-transparent p-3 dark:border-gray-700 dark:bg-transparent md:px-10">
          <FormButton loading={loading} text={"Submit"} />
        </div>
      </form>
    </Form>
  );
}
