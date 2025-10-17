import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t bg-muted/50 mt-auto">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<BookOpen className="h-6 w-6 text-primary" />
							<span className="text-lg font-bold">BookNest</span>
						</div>
						<p className="text-sm text-muted-foreground">
							Nền tảng mua bán sách trực tuyến hàng đầu Việt Nam
						</p>
					</div>

					{/* Quick Links */}
					<div className="space-y-3">
						<h3 className="font-semibold text-sm">Liên kết nhanh</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link to="/customer" className="hover:text-foreground transition-colors">
									Trang chủ
								</Link>
							</li>
							<li>
								<Link to="/customer/orders" className="hover:text-foreground transition-colors">
									Đơn hàng
								</Link>
							</li>
							<li>
								<Link to="/customer/wishlist" className="hover:text-foreground transition-colors">
									Yêu thích
								</Link>
							</li>
						</ul>
					</div>

					{/* Support */}
					<div className="space-y-3">
						<h3 className="font-semibold text-sm">Hỗ trợ</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link to="#" className="hover:text-foreground transition-colors">
									Trung tâm trợ giúp
								</Link>
							</li>
							<li>
								<Link to="#" className="hover:text-foreground transition-colors">
									Chính sách đổi trả
								</Link>
							</li>
							<li>
								<Link to="#" className="hover:text-foreground transition-colors">
									Liên hệ
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div className="space-y-3">
						<h3 className="font-semibold text-sm">Pháp lý</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<Link to="#" className="hover:text-foreground transition-colors">
									Điều khoản dịch vụ
								</Link>
							</li>
							<li>
								<Link to="#" className="hover:text-foreground transition-colors">
									Chính sách bảo mật
								</Link>
							</li>
							<li>
								<Link to="#" className="hover:text-foreground transition-colors">
									Quy định sử dụng
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<Separator className="my-6" />

				<div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
					<p>© 2025 BookNest. Mọi quyền được bảo lưu.</p>
					<div className="flex gap-4">
						<span>Tiếng Việt</span>
						<span>•</span>
						<span>VND</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
