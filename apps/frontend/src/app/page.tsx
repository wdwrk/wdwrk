import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from '~/components/ui/table';

export default function Page() {
	return (
		<div className="flex flex-col w-full min-h-screen">
			<header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
				<nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
					<Link className="flex items-center gap-2 text-lg font-semibold md:text-base" href="#">
						<span className="sr-only">Log Aggregation Dashboard</span>
					</Link>
					<select className="border border-gray-300 rounded-full text-gray-600 h-10 pl-5 pr-5 bg-white hover:border-gray-400 focus:outline-none appearance-none">
						<option>Log Stream 1</option>
						<option>Log Stream 2</option>
						<option>Log Stream 3</option>
					</select>
				</nav>
				<div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
					<Button className="rounded-full" size="icon" variant="outline">
						<span className="sr-only">User settings</span>
					</Button>
				</div>
			</header>
			<main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
				<div className="mt-8">
					<Card>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[100px]">Timestamp</TableHead>
									<TableHead>Source</TableHead>
									<TableHead>Message</TableHead>
									<TableHead className="text-right">Severity</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell className="font-medium">10:24:15</TableCell>
									<TableCell>App</TableCell>
									<TableCell>Log Message</TableCell>
									<TableCell className="text-right">High</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium">10:24:18</TableCell>
									<TableCell>DB</TableCell>
									<TableCell>Log Message</TableCell>
									<TableCell className="text-right">Medium</TableCell>
								</TableRow>
								<TableRow>
									<TableCell className="font-medium">10:24:20</TableCell>
									<TableCell>System</TableCell>
									<TableCell>Log Message</TableCell>
									<TableCell className="text-right">Low</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</Card>
				</div>
			</main>
		</div>
	);
}
