"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Toggle,
  Textarea,
  Card,
  CardTitle,
  Badge,
  Avatar,
  Stat,
  StatItem,
  StatTitle,
  StatValue,
  StatDesc,
  Divider,
  Modal,
  ModalActions,
  Alert,
  Skeleton,
  SkeletonCircle,
  Progress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  ErrorState,
} from "@/components/ui";
import {
  UsersIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@/components/ui/Icon";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { ContactCard } from "@/components/ContactCard";
import { SelectionToolbar } from "@/components/SelectionToolbar";

export default function UIComponentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toggleValue, setToggleValue] = useState(false);
  const [selectedCount] = useState(3);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Design System</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <Card>
            <CardTitle>Button Variants</CardTitle>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>

            <Divider className="my-6" />

            <CardTitle>Button Sizes</CardTitle>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>

            <Divider className="my-6" />

            <CardTitle>Loading State</CardTitle>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button loading>Loading</Button>
              <Button loading disabled>
                Disabled Loading
              </Button>
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Form Inputs</h2>
          <Card>
            <div className="grid grid-cols-1 gap-6">
              <Input label="Text Input" placeholder="Enter text..." />
              <Input
                label="With Error"
                placeholder="Enter text..."
                error="This field is required"
              />
              <Input
                label="With Hint"
                placeholder="Enter text..."
                hint="This is a helpful hint"
              />
              <Input
                label="With Icon"
                placeholder="Search..."
                leftIcon={
                  <MagnifyingGlassIcon className="w-5 h-5 text-base-content/50" />
                }
              />
              <Select label="Select Option">
                <option value="">Choose an option</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </Select>
              <Textarea
                label="Textarea"
                placeholder="Enter multiple lines..."
                rows={3}
              />
              <Textarea label="Monospace" placeholder="Code..." mono rows={3} />
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Form Controls</h2>
          <Card>
            <div className="flex flex-wrap gap-6">
              <Checkbox label="Checkbox Primary" defaultChecked />
              <Checkbox label="Checkbox Secondary" variant="secondary" />
              <Radio label="Radio Option A" name="radio-demo" defaultChecked />
              <Radio label="Radio Option B" name="radio-demo" />
              <Toggle
                label="Toggle Option"
                checked={toggleValue}
                onChange={(e) => setToggleValue(e.target.checked)}
              />
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Badges</h2>
          <Card>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="ghost">Ghost</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Divider className="my-6" />
            <CardTitle>Badge Sizes</CardTitle>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge size="xs">Extra Small</Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card bordered>
              <CardTitle>Basic Card</CardTitle>
              <p className="text-base-content/60 mt-2">
                This is a basic card with bordered style.
              </p>
            </Card>
            <Card accentColor="primary">
              <CardTitle>Primary Accent</CardTitle>
              <p className="text-base-content/60 mt-2">
                Card with primary color accent border.
              </p>
            </Card>
            <Card accentColor="secondary">
              <CardTitle>Secondary Accent</CardTitle>
              <p className="text-base-content/60 mt-2">
                Card with secondary color accent border.
              </p>
            </Card>
            <Card accentColor="success">
              <CardTitle>Success Accent</CardTitle>
              <p className="text-base-content/60 mt-2">
                Card with success color accent border.
              </p>
            </Card>
            <Card accentColor="warning">
              <CardTitle>Warning Accent</CardTitle>
              <p className="text-base-content/60 mt-2">
                Card with warning color accent border.
              </p>
            </Card>
            <Card accentColor="error">
              <CardTitle>Error Accent</CardTitle>
              <p className="text-base-content/60 mt-2">
                Card with error color accent border.
              </p>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Avatars</h2>
          <Card>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar initials="JD" size="xs" />
                <span className="text-xs text-base-content/60">
                  xs • w-6 • 10px
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar initials="AB" size="sm" />
                <span className="text-xs text-base-content/60">
                  sm • w-8 • 12px
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar initials="CD" size="md" />
                <span className="text-xs text-base-content/60">
                  md • w-10 • 14px
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar initials="EF" size="lg" />
                <span className="text-xs text-base-content/60">
                  lg • w-12 • 16px
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar initials="GH" size="xl" />
                <span className="text-xs text-base-content/60">
                  xl • w-16 • 18px
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Avatar initials="IJ" size="2xl" />
                <span className="text-xs text-base-content/60">
                  2xl • w-20 • 20px
                </span>
              </div>
            </div>
            <Divider className="my-6" />
            <CardTitle>Avatars with Status</CardTitle>
            <div className="flex flex-wrap items-end gap-4 mt-4">
              <Avatar initials="JS" size="lg" status="online" />
              <Avatar initials="MJ" size="lg" status="offline" />
              <Avatar initials="SK" size="lg" status="busy" />
              <Avatar initials="AL" size="lg" status="away" />
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Stats</h2>
          <Stat>
            <StatItem>
              <StatTitle>Total Members</StatTitle>
              <StatValue>1,234</StatValue>
              <StatDesc>From 45 families</StatDesc>
            </StatItem>
            <StatItem>
              <StatTitle>Visits This Week</StatTitle>
              <StatValue>12</StatValue>
              <StatDesc>3 remaining</StatDesc>
            </StatItem>
            <StatItem>
              <StatTitle>Pending Messages</StatTitle>
              <StatValue>48</StatValue>
              <StatDesc className="text-error">15 overdue</StatDesc>
            </StatItem>
          </Stat>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Stat Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Messages"
              value={156}
              icon={<EnvelopeIcon className="w-6 h-6" />}
              color="primary"
              href="#"
            />
            <StatCard
              title="Youth"
              value={24}
              icon={<UsersIcon className="w-6 h-6" />}
              color="accent"
              href="#"
            />
            <StatCard
              title="Interviews"
              value={8}
              icon={<CalendarDaysIcon className="w-6 h-6" />}
              color="secondary"
              href="#"
            />
            <StatCard
              title="Templates"
              value={12}
              icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
              color="success"
              href="#"
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="info">
              <InformationCircleIcon className="w-5 h-5" />
              This is an informational message.
            </Alert>
            <Alert variant="success">
              <CheckIcon className="w-5 h-5" />
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="warning">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Please review the information before proceeding.
            </Alert>
            <Alert variant="error">
              <XMarkIcon className="w-5 h-5" />
              An error occurred while processing your request.
            </Alert>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Progress</h2>
          <Card>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Default</span>
                  <span className="text-sm text-base-content/60">75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Secondary</span>
                  <span className="text-sm text-base-content/60">45%</span>
                </div>
                <Progress value={45} color="secondary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Success</span>
                  <span className="text-sm text-base-content/60">90%</span>
                </div>
                <Progress value={90} color="success" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Warning</span>
                  <span className="text-sm text-base-content/60">30%</span>
                </div>
                <Progress value={30} color="warning" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Error</span>
                  <span className="text-sm text-base-content/60">85%</span>
                </div>
                <Progress value={85} color="error" />
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Skeletons</h2>
          <Card>
            <div className="flex items-center gap-4">
              <SkeletonCircle size="w-12 h-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Divider className="my-6" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Sample Modal"
          >
            <p className="py-4">
              This is a sample modal dialog. You can put any content here.
            </p>
            <div className="form-control w-full mb-4">
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <ModalActions>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Save
              </Button>
            </ModalActions>
          </Modal>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Table</h2>
          <Card>
            <Table striped hoverable>
              <TableHead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john.doe@example.com</TableCell>
                  <TableCell>Elder</TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>jane.smith@example.com</TableCell>
                  <TableCell>Sister</TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bob Wilson</TableCell>
                  <TableCell>bob.wilson@example.com</TableCell>
                  <TableCell>Elder</TableCell>
                  <TableCell>
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Empty State</h2>
          <EmptyState
            icon={<UsersIcon className="w-8 h-8" />}
            title="No Contacts Found"
            description="Get started by adding your first contact to the system."
            action={{
              label: "Add Contact",
              onClick: () => alert("Add contact clicked"),
            }}
          />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Error State</h2>
          <ErrorState
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            title="Error Loading Data"
            description="Unable to load contacts. Please check your connection and try again."
            onRetry={() => alert("Retry clicked")}
          />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Section Headers</h2>
          <div className="space-y-4">
            <SectionHeader
              icon={<UsersIcon className="w-6 h-6" />}
              title="Members"
              description="Manage all ward members"
            />
            <SectionHeader
              icon={<CalendarDaysIcon className="w-6 h-6" />}
              title="Interviews"
              description="Schedule and track interviews"
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Contact Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContactCard
              name="John Doe"
              avatarInitials="JD"
              labels={["High Priority", "New Member"]}
              type="calling"
              contactInfo={{
                phone: "(555) 123-4567",
                email: "john.doe@email.com",
              }}
            />
            <ContactCard
              name="Jane Smith"
              avatarInitials="JS"
              labels={["Baptismal Candidate"]}
              type="interview"
              contactInfo={{
                phone: "(555) 987-6543",
                email: "jane.smith@email.com",
              }}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Selection Toolbar</h2>
          <Card>
            <SelectionToolbar
              selectedCount={selectedCount}
              actions={[
                {
                  label: "Merge",
                  icon: <UsersIcon className="w-4 h-4" />,
                  onClick: () => alert("Merge clicked"),
                },
                {
                  label: "Delete",
                  variant: "danger",
                  icon: <TrashIcon className="w-4 h-4" />,
                  onClick: () => alert("Delete clicked"),
                },
              ]}
            />
            <div className="mt-4 text-base-content/60">
              Select contacts to see the toolbar appear.
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Dividers</h2>
          <Card>
            <p>Content above</p>
            <Divider />
            <p>Content below</p>
            <Divider className="my-4" />
            <div className="flex items-center gap-4">
              <span>Left side</span>
              <Divider vertical />
              <span>Right side</span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
