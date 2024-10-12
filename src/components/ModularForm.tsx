"use client";

import React from "react";
import * as Form from "@radix-ui/react-form";
import style from "@/styles/form.module.css";

type Field = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validationMessage?: string;
};

interface ModularFormProps {
  fields: Field[];
  onSubmit: (formData: FormData) => void;
}

const ModularForm: React.FC<ModularFormProps> = ({ fields, onSubmit }) => {
  return (
    <div className={style["FormContainer"]}>
      <Form.Root
        className={style["FormRoot"]}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          onSubmit(formData); // call the function passed down as a prop
          (e.target as HTMLFormElement).reset(); // empty the form contents
        }}
      >
        {fields.map((field) => (
          <Form.Field
            className={style["FormField"]}
            name={field.name}
            key={field.name}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <Form.Label className={style["FormLabel"]}>
                {field.label}
              </Form.Label>
              {field.required && (
                <Form.Message
                  className={style["FormMessage"]}
                  match="valueMissing"
                >
                  {field.validationMessage || `Please enter your ${field.name}`}
                </Form.Message>
              )}
            </div>
            <Form.Control asChild>
              {field.type === "textarea" ? (
                <textarea
                  className={style["Textarea"]}
                  required={field.required}
                />
              ) : (
                <input
                  className={style["Input"]}
                  type={field.type}
                  required={field.required}
                />
              )}
            </Form.Control>
          </Form.Field>
        ))}
        <Form.Submit asChild>
          <button className={style["Button"]} style={{ marginTop: 10 }}>
            Submit
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default ModularForm;
