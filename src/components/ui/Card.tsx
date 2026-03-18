import { type ReactNode } from "react";

export interface CardProps {
  className?: string;
  children: ReactNode;
}

export interface CardHeaderProps {
  className?: string;
  children: ReactNode;
}

export interface CardBodyProps {
  className?: string;
  children: ReactNode;
}

export interface CardFooterProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: CardHeaderProps) {
  return (
    <div className={`card-body ${className}`}>
      <h2 className="card-title">{children}</h2>
    </div>
  );
}

Card.Header = CardHeader;

export function CardBody({ className = "", children }: CardBodyProps) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

Card.Body = CardBody;

export function CardFooter({ className = "", children }: CardFooterProps) {
  return (
    <div className={`card-actions justify-end ${className}`}>{children}</div>
  );
}

Card.Footer = CardFooter;
