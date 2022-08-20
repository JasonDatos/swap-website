<?php
// crossaddr in php (ugh)
// (c) barrystyle 29112018
// needs php-bcmath

// ripped from https://gist.github.com/rubensayshi/16d70b66f888442ff8a6 and modularised/packed
class base58
{
    protected static $HEXCHARS = "0123456789ABCDEF";
    protected static $BASE58CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    protected function decodeHex($hex) {
        $hex = strtoupper($hex);
        $return = "0";
        for ($i = 0; $i < strlen($hex); $i++) {
            $current = (string) strpos(self::$HEXCHARS, $hex[$i]);
            $return = (string) bcmul($return, "16", 0);
            $return = (string) bcadd($return, $current, 0);
        }
        return $return;
    }

    protected function encodeHex($dec) {
        $return = "";
        while (bccomp($dec, 0) == 1) {
            $dv = (string) bcdiv($dec, "16", 0);
            $rem = (integer) bcmod($dec, "16");
            $dec = $dv;
            $return = $return . self::$HEXCHARS[$rem];
        }
        return strrev($return);
    }

    protected function decodeBase58($base58) {
        $origbase58 = $base58;
        if (preg_match('/[^1-9A-HJ-NP-Za-km-z]/', $base58))
            return "";
        $return = "0";
        for ($i = 0; $i < strlen($base58); $i++) {
            $current = (string) strpos(self::$BASE58CHARS, $base58[$i]);
            $return = (string) bcmul($return, "58", 0);
            $return = (string) bcadd($return, $current, 0);
        }
        $return = $this->encodeHex($return);
        for ($i = 0; $i < strlen($origbase58) && $origbase58[$i] == "1"; $i++)
            $return = "00" . $return;
        if (strlen($return) % 2 != 0)
            $return = "0" . $return;
        return $return;
    }

    protected function encodeBase58($hex) {
        if (strlen($hex) % 2 != 0)
            die("encodeBase58: uneven number of hex characters");
        $orighex = $hex;
        $hex = $this->decodeHex($hex);
        $return = "";
        while (bccomp($hex, 0) == 1) {
            $dv = (string) bcdiv($hex, "58", 0);
            $rem = (integer) bcmod($hex, "58");
            $hex = $dv;
            $return = $return . self::$BASE58CHARS[$rem];
        }
        $return = strrev($return);
        for ($i = 0; $i < strlen($orighex) && substr($orighex, $i, 2) == "00"; $i += 2)
            $return = "1" . $return;
        return $return;
    }

    public function hash160ToAddress($hash160, $addressversion) {
        $hash160 = $addressversion . $hash160;
        $check = pack("H*", $hash160);
        $check = hash("sha256", hash("sha256", $check, true));
        $check = substr($check, 0, 8);
        $hash160 = strtoupper($hash160 . $check);
        return $this->encodeBase58($hash160);
    }

    public function addressToHash160($addr) {
        $addr = $this->decodeBase58($addr);
        $addr = substr($addr, 2, strlen($addr) - 10);
        return $addr;
    }

    public function checkAddress($addr, $addressversion) {
        $addr = $this->decodeBase58($addr);
        if (strlen($addr) != 50)
            return false;
        $version = substr($addr, 0, 2);
        if (hexdec($version) != hexdec($addressversion))
            return false;
        $check = substr($addr, 0, strlen($addr) - 8);
        $check = pack("H*", $check);
        $check = strtoupper(hash("sha256", hash("sha256", $check, true)));
        $check = substr($check, 0, 8);
        return $check == substr($addr, strlen($addr) - 8);
    }

    public function checkAnyAddress($addr) {
        $addr = $this->decodeBase58($addr);
        if (strlen($addr) != 50)
            return false;
        $version = substr($addr, 0, 2);
        $check = substr($addr, 0, strlen($addr) - 8);
        $check = pack("H*", $check);
        $check = strtoupper(hash("sha256", hash("sha256", $check, true)));
        $check = substr($check, 0, 8);
        return $check == substr($addr, strlen($addr) - 8);
    }

    public function hash160($data) {
        $data = pack("H*", $data);
        return strtoupper(hash("ripemd160", hash("sha256", $data, true)));
    }

    public function pubKeyToAddress($pubkey, $addressversion) {
        return $this->hash160ToAddress($this->hash160($pubkey), $addressversion);
    }

    public function remove0x($string) {
        if (substr($string, 0, 2) == "0x" || substr($string, 0, 2) == "0X")
            $string = substr($string, 2);
        return $string;
    }
}

class crosschain
{
    public function addressencode($inputaddress, $versionbyte) {
	$base58parser = new base58();
	if (strlen($inputaddress) != 34 || !$base58parser->checkAnyAddress($inputaddress))
	   die("invalid base58 input address");
	$addresshalveone = bin2hex(substr($inputaddress,0,17));
	$addresshalvetwo = bin2hex(substr($inputaddress,17,17));
	$addresshalveone = $addresshalveone . substr(hash("sha256",hex2bin($addresshalveone)),34,4) . "01";
	$addresshalvetwo = $addresshalvetwo . substr(hash("sha256",hex2bin($addresshalvetwo)),34,4) . "02";
	$addressfirst = $base58parser->hash160ToAddress($addresshalveone,$versionbyte);
	$addresssecond = $base58parser->hash160ToAddress($addresshalvetwo,$versionbyte);
	$returnstring = "[\"".$addressfirst . '","' . $addresssecond."\"]";
	return $returnstring;
    }
}

// call to test
$crosschainenc = new crosschain();
echo $crosschainenc->addressencode($_GET['mergeaddress'],$_GET['version']);

?>