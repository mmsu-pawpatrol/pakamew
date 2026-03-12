import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshakeIcon, SendHorizontalIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { CHAT_MESSAGES } from "./-chat-panel-seed";

const MAX_CHAT_MESSAGE_LENGTH = 256;

function getAuthorInitials(author: string) {
	return author
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? "")
		.join("");
}

export function ChatPanel() {
	const panelRef = useRef<HTMLElement>(null);
	const [draftMessage, setDraftMessage] = useState("");

	useLayoutEffect(() => {
		const viewport = panelRef.current?.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']");
		if (!viewport) {
			return;
		}
		viewport.scrollTop = viewport.scrollHeight;
	}, []);

	function handleDraftChange(nextValue: string) {
		setDraftMessage(nextValue.slice(0, MAX_CHAT_MESSAGE_LENGTH));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draftMessage.trim()) {
			return;
		}
		// Local-only composer behavior for now; backend send flow is not integrated yet.
		setDraftMessage("");
	}

	return (
		<section ref={panelRef} className="flex h-full min-h-0 flex-col overflow-hidden">
			{/* <div className="text-muted-foreground inline-flex items-center gap-2 overflow-hidden border-b px-3 py-2 text-xs">
				<PinIcon className="size-3.5 shrink-0" />
				<p className="truncate whitespace-nowrap">
					<span className="text-foreground font-semibold">Note:</span> Please keep messages respectful
				</p>
			</div> */}

			<ScrollArea className="min-h-0 flex-1">
				<div className="flex flex-col gap-4 px-4 py-4">
					{CHAT_MESSAGES.map((chat) => (
						<div key={chat.id} className="flex items-start gap-3">
							<Avatar size="sm">
								<AvatarFallback>{getAuthorInitials(chat.author)}</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1">
								<div className="mb-0.5 flex items-center justify-between gap-2">
									<span className="text-xs font-medium">{chat.author}</span>
									<span className="text-muted-foreground text-[11px]">{chat.time}</span>
								</div>
								<p className="text-muted-foreground text-sm leading-relaxed">{chat.message}</p>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			<div className="bg-card shrink-0 border-t px-4 pt-3 pb-10 lg:pb-3">
				<form className="flex items-end gap-2" onSubmit={handleSubmit}>
					<div className="relative flex-1">
						<Textarea
							placeholder="Add comment..."
							value={draftMessage}
							onChange={(event) => handleDraftChange(event.target.value)}
							maxLength={MAX_CHAT_MESSAGE_LENGTH}
							className="max-h-28 min-h-10 resize-none rounded-2xl py-2 pr-12"
						/>
						<Button
							type="submit"
							size="icon-sm"
							className="absolute right-1.5 bottom-1.5 rounded-full"
							disabled={!draftMessage.trim()}
							aria-label="Send message">
							<SendHorizontalIcon className="size-4" />
						</Button>
					</div>

					<Button type="button" className="h-10 gap-2 rounded-full px-4 font-semibold" aria-label="Feed animals">
						<HeartHandshakeIcon className="size-4" />
						Feed
					</Button>
				</form>
			</div>
		</section>
	);
}
