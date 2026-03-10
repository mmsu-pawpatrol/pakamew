import { describe, expect, it } from "vitest";
import { applyOrpcRouteMetadata, type OrpcRouteMetadataCarrier } from "./metadata-carrier";

describe("oRPC metadata carrier", () => {
	it("applies metadata updates to a route metadata carrier", () => {
		const carrier: OrpcRouteMetadataCarrier = {
			orpcRouteMetadata: {
				httpRouteTemplate: "/fallback",
				procedure: "/fallback",
			},
		};

		applyOrpcRouteMetadata(
			carrier,
			{
				"~orpc": {
					route: {
						path: "/posts/{postId}",
						operationId: "getPost",
					},
				},
			},
			["posts", "postId"],
		);

		expect(carrier.orpcRouteMetadata).toEqual({
			httpRouteTemplate: "/posts/{postId}",
			procedure: "/posts/postId",
			operationId: "getPost",
		});
	});
});
