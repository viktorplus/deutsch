import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...values: Parameters<typeof clsx>) => twMerge(clsx(...values));
const buttonVariants = cva('btn', { variants: { variant: { default: '', secondary: 'btn-secondary', danger: 'btn-danger' } }, defaultVariants: { variant: 'default' } });
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'default' | 'secondary' | 'danger'; asChild?: boolean }
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, asChild, type = 'button', ...props }, ref) => { const Component = asChild ? Slot : 'button'; return <Component ref={ref} type={type} className={cn(buttonVariants({ variant }), className)} {...props} />; });
Button.displayName = 'Button';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn('field', className)} {...props} />);
Input.displayName = 'Input';
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn('panel', className)} {...props} />; }
