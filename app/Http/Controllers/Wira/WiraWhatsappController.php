<?php

namespace App\Http\Controllers\Wira;

use App\Models\WiraMessageLog;
use App\Models\WiraWhatsappGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WiraWhatsappController
{
    /**
     * URL WhatsApp Gateway service (Node.js lokal)
     */
    private string $gatewayUrl;

    public function __construct()
    {
        $this->gatewayUrl = config('wira.whatsapp_gateway_url', 'http://localhost:3001');
    }

    /**
     * Kirim pesan ke grup-grup WhatsApp yang dipilih.
     * Menghit WhatsApp Gateway service (Node.js) di localhost:3001.
     */
    public function send(Request $request)
    {
        $request->validate([
            'message'    => 'required|string|max:4096',
            'group_ids'  => 'required|array|min:1',
            'group_ids.*' => 'exists:wira_whatsapp_groups,id',
        ]);

        // Cek apakah gateway online dulu
        try {
            $healthCheck = Http::timeout(3)->get("{$this->gatewayUrl}/health");
            if (!$healthCheck->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'WhatsApp Gateway tidak merespons. Pastikan service Node.js sudah berjalan.',
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat terhubung ke WhatsApp Gateway (localhost:3001). Pastikan service sudah dijalankan dengan `node index.js`.',
                'hint'    => 'Jalankan: cd whatsapp-gateway && npm install && node index.js',
            ], 503);
        }

        // Cek status koneksi WA
        $statusRes = Http::timeout(5)->get("{$this->gatewayUrl}/status");
        $statusData = $statusRes->json();
        if (($statusData['status'] ?? '') !== 'ready') {
            return response()->json([
                'success' => false,
                'message' => 'WhatsApp belum siap. Buka terminal dan scan QR Code yang tampil.',
                'wa_status' => $statusData['status'] ?? 'unknown',
            ], 503);
        }

        $results = [];
        $user = $request->user();

        foreach ($request->input('group_ids') as $groupId) {
            $group = WiraWhatsappGroup::findOrFail($groupId);

            $status = 'failed';
            $gatewayResponse = null;

            try {
                // Kirim ke gateway Node.js
                $response = Http::timeout(15)->post("{$this->gatewayUrl}/send", [
                    'to'      => $group->group_id,
                    'message' => $request->input('message'),
                ]);

                $gatewayResponse = $response->json();

                if ($response->successful() && ($gatewayResponse['success'] ?? false)) {
                    $status = 'sent';
                    Log::info("WIRA WA: Pesan terkirim ke grup [{$group->name}] ({$group->group_id})");
                } else {
                    Log::warning("WIRA WA: Gagal kirim ke [{$group->name}]", $gatewayResponse ?? []);
                }
            } catch (\Exception $e) {
                Log::error("WIRA WA: Exception kirim ke [{$group->name}]: " . $e->getMessage());
            }

            // Simpan log ke database
            $log = WiraMessageLog::create([
                'user_id'  => $user->id,
                'group_id' => $group->id,
                'message'  => $request->input('message'),
                'status'   => $status,
            ]);

            $results[] = [
                'group'   => $group->name,
                'status'  => $status,
                'log_id'  => $log->id,
            ];
        }

        $sentCount = count(array_filter($results, fn($r) => $r['status'] === 'sent'));
        $total     = count($results);

        return response()->json([
            'success' => $sentCount > 0,
            'message' => $sentCount === $total
                ? "Pesan berhasil dikirim ke {$total} grup WhatsApp."
                : "Pesan terkirim ke {$sentCount} dari {$total} grup. Cek log untuk detail.",
            'results' => $results,
            'summary' => ['sent' => $sentCount, 'failed' => $total - $sentCount, 'total' => $total],
        ]);
    }

    /**
     * Cek status koneksi WhatsApp Gateway (dan ambil QR code jika belum scan)
     */
    public function status()
    {
        try {
            $res = Http::timeout(4)->get("{$this->gatewayUrl}/status");
            if ($res->successful()) {
                return response()->json([
                    'online' => true,
                    ...$res->json(),
                ]);
            }
        } catch (\Exception $e) {
            // Gateway offline
        }

        return response()->json([
            'online' => false,
            'status' => 'offline',
            'connected' => false,
            'message' => 'WhatsApp Gateway offline. Jalankan: cd whatsapp-gateway && node index.js',
        ]);
    }

    /**
     * Logout / disconnect sesi WhatsApp
     */
    public function logout()
    {
        try {
            $res = Http::timeout(5)->post("{$this->gatewayUrl}/logout");
            return response()->json($res->json());
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}